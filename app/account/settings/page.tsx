import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { AccountSettingsClient } from './settings-client'

async function getUserData(userId: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    
    // Fetch preferences and privacy settings
    const [preferencesResponse, privacyResponse] = await Promise.all([
      fetch(`${baseUrl}/api/account/preferences`, {
        headers: { 'user-id': userId },
        cache: 'no-store'
      }),
      fetch(`${baseUrl}/api/account/privacy`, {
        headers: { 'user-id': userId },
        cache: 'no-store'
      })
    ])

    const preferences = preferencesResponse.ok ? await preferencesResponse.json() : { preferences: {} }
    const privacy = privacyResponse.ok ? await privacyResponse.json() : { privacy: {} }

    return {
      preferences: preferences.preferences,
      privacy: privacy.privacy
    }
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return {
      preferences: {},
      privacy: {}
    }
  }
}

export default async function AccountSettingsPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const userData = await getUserData(session.user.id)

  const user = {
    id: session.user.id,
    name: session.user.name || '',
    email: session.user.email || '',
    role: session.user.role || 'customer',
    preferences: userData.preferences,
    privacy: userData.privacy
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <AccountSettingsClient user={user} />
      </main>
      
      <Footer />
    </div>
  )
}