import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PrivacyDashboardClient } from './privacy-client'

async function getUserPrivacyData(userId: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Fetch consent preferences and data usage settings
    const [consentResponse, dataUsageResponse] = await Promise.all([
      fetch(`${baseUrl}/api/privacy/consent`, {
        headers: { 'user-id': userId },
        cache: 'no-store'
      }),
      fetch(`${baseUrl}/api/privacy/data-usage`, {
        headers: { 'user-id': userId },
        cache: 'no-store'
      })
    ])

    const consent = consentResponse.ok ? await consentResponse.json() : { consent: {} }
    const dataUsage = dataUsageResponse.ok ? await dataUsageResponse.json() : { dataUsage: {} }

    return {
      consent: consent.consent,
      dataUsage: dataUsage.dataUsage
    }
  } catch (error) {
    console.error('Failed to fetch privacy data:', error)
    return {
      consent: {},
      dataUsage: {}
    }
  }
}

export default async function PrivacyDashboardPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const privacyData = await getUserPrivacyData(session.user.id)

  const user = {
    id: session.user.id,
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role || 'customer',
    createdAt: session.user.createdAt || new Date().toISOString(),
    lastLogin: session.user.lastLogin
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <PrivacyDashboardClient 
          user={user} 
          consent={privacyData.consent}
          dataUsage={privacyData.dataUsage}
        />
      </main>
      
      <Footer />
    </div>
  )
}