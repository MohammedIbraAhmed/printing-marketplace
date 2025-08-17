import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { UserManagementClient } from './user-management-client'

async function getUsers(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const params = new URLSearchParams()
    
    if (searchParams.page) params.set('page', searchParams.page as string)
    if (searchParams.limit) params.set('limit', searchParams.limit as string)
    if (searchParams.role) params.set('role', searchParams.role as string)
    if (searchParams.status) params.set('status', searchParams.status as string)
    if (searchParams.search) params.set('search', searchParams.search as string)
    
    const response = await fetch(`${baseUrl}/api/admin/users?${params.toString()}`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.users || []
    }
    
    return []
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return []
  }
}

interface AdminUsersPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'admin') {
    redirect('/unauthorized')
  }

  const users = await getUsers(searchParams)

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <UserManagementClient users={users} />
      </main>
      
      <Footer />
    </div>
  )
}