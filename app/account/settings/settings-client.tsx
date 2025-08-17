'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AccountSettings } from '@/components/profile/account-settings'
import type { PasswordChangeData, NotificationPreferences, PrivacySettings } from '@/lib/validations/profile'

interface User {
  id: string
  name: string
  email: string
  role: string
  preferences?: {
    notifications?: {
      email: boolean
      orderUpdates: boolean
      marketing: boolean
      weeklyDigest?: boolean
      pushNotifications?: boolean
      smsNotifications?: boolean
    }
  }
  privacy?: {
    profileVisibility: 'public' | 'business-only' | 'private'
    showEmail: boolean
    showPhone: boolean
    allowDataSharing: boolean
    allowMarketingEmails: boolean
    allowAnalytics: boolean
  }
}

interface AccountSettingsClientProps {
  user: User
}

export function AccountSettingsClient({ user: initialUser }: AccountSettingsClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handlePasswordChange = async (data: PasswordChangeData) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/account/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update password')
      }

      // Success - no need to refresh as password form will reset itself
      
    } catch (error) {
      console.error('Failed to update password:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleNotificationUpdate = async (data: NotificationPreferences) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/account/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update notification preferences')
      }

      // Optionally refresh to get updated data
      router.refresh()
      
    } catch (error) {
      console.error('Failed to update notification preferences:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrivacyUpdate = async (data: PrivacySettings) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/account/privacy', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update privacy settings')
      }

      // Optionally refresh to get updated data
      router.refresh()
      
    } catch (error) {
      console.error('Failed to update privacy settings:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataExport = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/account/export?format=json')
      
      if (!response.ok) {
        throw new Error('Failed to export data')
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `account-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error) {
      console.error('Failed to export data:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleAccountDeactivation = async (reason: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/account/deactivate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to deactivate account')
      }

      // Account deactivated successfully - redirect to home page
      alert('Your account has been deactivated. You will be redirected to the home page.')
      router.push('/')
      
    } catch (error) {
      console.error('Failed to deactivate account:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AccountSettings
      user={initialUser}
      onPasswordChange={handlePasswordChange}
      onNotificationUpdate={handleNotificationUpdate}
      onPrivacyUpdate={handlePrivacyUpdate}
      onDataExport={handleDataExport}
      onAccountDeactivation={handleAccountDeactivation}
      isLoading={isLoading}
    />
  )
}