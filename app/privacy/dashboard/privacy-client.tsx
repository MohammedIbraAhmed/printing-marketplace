'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PrivacyDashboard } from '@/components/profile/privacy-dashboard'
import type { ConsentPreferences, DataUsageConsent } from '@/lib/validations/profile'

interface User {
  id: string
  name: string
  email: string
  role: string
  createdAt: string
  lastLogin?: string
}

interface PrivacyDashboardClientProps {
  user: User
  consent?: ConsentPreferences
  dataUsage?: DataUsageConsent
}

export function PrivacyDashboardClient({ 
  user, 
  consent, 
  dataUsage 
}: PrivacyDashboardClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleConsentUpdate = async (updatedConsent: ConsentPreferences) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/privacy/consent', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedConsent),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update consent preferences')
      }

      // Refresh to get updated data
      router.refresh()
      
    } catch (error) {
      console.error('Failed to update consent preferences:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleDataUsageUpdate = async (updatedDataUsage: DataUsageConsent) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/privacy/data-usage', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedDataUsage),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update data usage preferences')
      }

      // Refresh to get updated data
      router.refresh()
      
    } catch (error) {
      console.error('Failed to update data usage preferences:', error)
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
      a.download = `privacy-data-export-${new Date().toISOString().split('T')[0]}.json`
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

  const handleAccountDeletion = async () => {
    const reason = prompt('Please provide a reason for account deletion (required):')
    
    if (!reason || reason.trim().length === 0) {
      alert('A reason is required for account deletion.')
      return
    }

    if (!window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone and will permanently remove all your data.')) {
      return
    }

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
        throw new Error(errorData.error || 'Failed to delete account')
      }

      // Account deleted successfully - redirect to home page
      alert('Your account has been permanently deleted. You will be redirected to the home page.')
      router.push('/')
      
    } catch (error) {
      console.error('Failed to delete account:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <PrivacyDashboard
      user={user}
      consent={consent}
      dataUsage={dataUsage}
      onConsentUpdate={handleConsentUpdate}
      onDataUsageUpdate={handleDataUsageUpdate}
      onDataExport={handleDataExport}
      onAccountDeletion={handleAccountDeletion}
      isLoading={isLoading}
    />
  )
}