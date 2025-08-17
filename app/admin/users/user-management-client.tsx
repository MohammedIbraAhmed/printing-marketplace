'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { UserManagement } from '@/components/admin/user-management'

interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'creator' | 'printShop' | 'admin'
  status: 'active' | 'suspended' | 'pending'
  emailVerified: boolean
  createdAt: string
  lastLogin?: string
  profile?: {
    location?: {
      city?: string
      state?: string
    }
    businessInfo?: {
      businessName?: string
      businessType?: string
    }
    verification?: {
      status: 'verified' | 'pending' | 'rejected' | 'unverified'
    }
  }
}

interface UserManagementClientProps {
  users: User[]
}

export function UserManagementClient({ users: initialUsers }: UserManagementClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRoleChange = async (userId: string, newRole: string, reason: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'role',
          value: newRole,
          reason
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change user role')
      }

      // Refresh the page to show updated data
      router.refresh()
      
    } catch (error) {
      console.error('Failed to change user role:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (userId: string, newStatus: string, reason: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          action: 'status',
          value: newStatus,
          reason
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change user status')
      }

      // Refresh the page to show updated data
      router.refresh()
      
    } catch (error) {
      console.error('Failed to change user status:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportUsers = async () => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/users/export?format=csv')
      
      if (!response.ok) {
        throw new Error('Failed to export users')
      }

      // Create download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
    } catch (error) {
      console.error('Failed to export users:', error)
      alert('Failed to export users. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <UserManagement
      users={initialUsers}
      onRoleChange={handleRoleChange}
      onStatusChange={handleStatusChange}
      onExportUsers={handleExportUsers}
      isLoading={isLoading}
    />
  )
}