# Authentication Architecture

## NextAuth.js v5 Configuration
```typescript
// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(db),
  providers: [
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "customer" // default role
        }
      }
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Custom authentication logic
        const user = await authenticateUser(credentials.email, credentials.password)
        return user || null
      }
    })
  ],
  
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },
    
    session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  }
})
```

## Role-Based Access Control
```typescript
// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const userRole = req.auth?.user?.role

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Print shop routes
  if (pathname.startsWith('/shop-dashboard')) {
    if (userRole !== 'printShop') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Creator routes
  if (pathname.startsWith('/creator-dashboard')) {
    if (userRole !== 'creator') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/shop-dashboard/:path*', '/creator-dashboard/:path*']
}
```

---
