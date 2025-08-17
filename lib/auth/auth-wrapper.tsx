import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

interface AuthWrapperProps {
  children: ReactNode
  allowedRoles?: string[]
  requireAuth?: boolean
}

export async function AuthWrapper({ 
  children, 
  allowedRoles = [], 
  requireAuth = true 
}: AuthWrapperProps) {
  const session = await auth()

  // Check if authentication is required
  if (requireAuth && !session?.user) {
    redirect('/auth/signin')
  }

  // Check if user has required role
  if (allowedRoles.length > 0 && session?.user) {
    const userRole = session.user.role
    if (!allowedRoles.includes(userRole)) {
      redirect('/unauthorized')
    }
  }

  return <>{children}</>
}

// Convenience wrappers for specific roles
export async function AdminOnly({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper allowedRoles={['admin']}>
      {children}
    </AuthWrapper>
  )
}

export async function CreatorOnly({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper allowedRoles={['creator', 'admin']}>
      {children}
    </AuthWrapper>
  )
}

export async function PrintShopOnly({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper allowedRoles={['printShop', 'admin']}>
      {children}
    </AuthWrapper>
  )
}

export async function AuthenticatedOnly({ children }: { children: ReactNode }) {
  return (
    <AuthWrapper requireAuth={true}>
      {children}
    </AuthWrapper>
  )
}