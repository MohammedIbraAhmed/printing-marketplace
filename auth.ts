import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"
import bcrypt from "bcryptjs"
import { User } from "@/lib/models"
import connectToDatabase from "@/lib/database"

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = Promise.resolve(client)

async function authenticateUser(email: string, password: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ email: email.toLowerCase() })
    
    if (!user) {
      return null
    }

    // Check if user has a password (some users might only have OAuth)
    if (!user.password) {
      return null
    }

    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return null
    }

    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      image: user.image,
      role: user.role,
      emailVerified: user.emailVerified
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise, {
    databaseName: process.env.MONGODB_DB_NAME
  }),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.email === process.env.SUPER_ADMIN_EMAIL ? "admin" : "customer",
          emailVerified: new Date()
        }
      }
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await authenticateUser(
          credentials.email as string,
          credentials.password as string
        )
        
        return user
      }
    })
  ],
  callbacks: {
    jwt({ token, user, account }) {
      if (user) {
        token.role = user.role
        token.userId = user.id || ''
      }
      return token
    },
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  session: {
    strategy: "jwt"
  }
})