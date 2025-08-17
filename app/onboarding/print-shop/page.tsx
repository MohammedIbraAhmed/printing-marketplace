import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import connectToDatabase from '@/lib/database'
import { User as UserModel } from '@/lib/models'

export const metadata = {
  title: 'Print Shop Onboarding - PrintMarket',
  description: 'Complete your print shop profile to start receiving orders',
}

async function getOnboardingData(userId: string) {
  try {
    await connectToDatabase()
    
    const user = await UserModel.findById(userId).select('profile onboarding role').lean()
    
    if (!user) {
      return { user: null, existingProfile: null }
    }
    
    return {
      user: {
        id: user._id.toString(),
        role: user.role,
      },
      existingProfile: user.profile || null,
    }
  } catch (error) {
    console.error('Error fetching onboarding data:', error)
    return { user: null, existingProfile: null }
  }
}

export default async function PrintShopOnboardingPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/onboarding/print-shop')
  }
  
  // Check if user is a print shop
  await connectToDatabase()
  const user = await UserModel.findById(session.user.id).select('role name email profile onboarding').lean()
  
  if (!user) {
    redirect('/auth/signin?callbackUrl=/onboarding/print-shop')
  }
  
  if (user.role !== 'printShop') {
    redirect('/dashboard?error=unauthorized')
  }
  
  // Check if onboarding is already completed
  if (user.onboarding?.completed) {
    redirect('/shop/dashboard?onboarding=already-complete')
  }
  
  const { existingProfile } = await getOnboardingData(session.user.id)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <OnboardingWizard
        user={{
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        existingProfile={existingProfile}
      />
    </div>
  )
}