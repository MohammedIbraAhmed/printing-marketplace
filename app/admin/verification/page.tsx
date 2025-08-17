import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { VerificationQueueClient } from './verification-queue-client'

async function getVerificationRequests() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/admin/verification`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.verifications || []
    }
    
    return []
  } catch (error) {
    console.error('Failed to fetch verification requests:', error)
    return []
  }
}

export default async function AdminVerificationPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'admin') {
    redirect('/unauthorized')
  }

  const verifications = await getVerificationRequests()

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <VerificationQueueClient verifications={verifications} />
      </main>
      
      <Footer />
    </div>
  )
}