import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { CustomerProfileForm } from '@/components/profile/customer-profile-form'
import { CreatorProfileForm } from '@/components/profile/creator-profile-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { User as UserModel } from '@/lib/models'
import connectToDatabase from '@/lib/database'
import { ProfileEditClient } from '@/components/profile/profile-edit-client'

async function getUserProfile(userId: string) {
  await connectToDatabase()
  const user = await UserModel.findById(userId).select('-password').lean()
  return user ? JSON.parse(JSON.stringify(user)) : null
}

export default async function ProfileEditPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await getUserProfile(session.user.id)
  
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/profile">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Edit Profile</h1>
                <p className="text-muted-foreground">
                  Update your profile information and preferences
                </p>
              </div>
            </div>

            {/* Profile completion notice */}
            {(!user.name || !user.profile) && (
              <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <CardHeader>
                  <CardTitle className="text-amber-800 dark:text-amber-200">
                    Complete Your Profile
                  </CardTitle>
                  <CardDescription className="text-amber-700 dark:text-amber-300">
                    Complete your profile to get the most out of PrintMarket. 
                    A complete profile helps you connect with the right {user.role === 'customer' ? 'print shops' : 'customers'}.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Dynamic Profile Form */}
            <ProfileEditClient user={user} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}