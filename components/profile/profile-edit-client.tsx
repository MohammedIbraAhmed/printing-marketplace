'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { CustomerProfileForm } from './customer-profile-form'
import { CreatorProfileForm } from './creator-profile-form'
import { PrintShopProfileForm } from './printshop-profile-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'
import type { CustomerProfile, CreatorProfile, PrintShopProfile } from '@/lib/validations/profile'

interface ProfileEditClientProps {
  user: {
    id: string
    name?: string | null
    email: string
    image?: string | null
    role: string
    profile?: any
  }
}

export function ProfileEditClient({ user }: ProfileEditClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async (data: CustomerProfile | CreatorProfile | PrintShopProfile) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }

      // Refresh the page data
      router.refresh()
      
      // Optionally redirect to profile view
      // router.push('/profile')
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Render appropriate form based on user role
  const renderProfileForm = () => {
    switch (user.role) {
      case 'customer':
        return (
          <CustomerProfileForm
            user={user}
            onSave={handleSave as (data: CustomerProfile) => Promise<void>}
            isLoading={isLoading}
          />
        )
      
      case 'creator':
        return (
          <CreatorProfileForm
            user={user}
            onSave={handleSave as (data: CreatorProfile) => Promise<void>}
            isLoading={isLoading}
          />
        )
      
      case 'printShop':
        return (
          <PrintShopProfileForm
            user={user}
            onSave={handleSave as (data: PrintShopProfile) => Promise<void>}
            isLoading={isLoading}
          />
        )
      
      case 'admin':
        return (
          <Card>
            <CardHeader>
              <CardTitle>Admin Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Admin profile management is handled through the admin dashboard. Contact your system administrator for profile updates.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )
      
      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Unknown User Role</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Unknown user role: {user.role}. Please contact support for assistance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )
    }
  }

  return renderProfileForm()
}