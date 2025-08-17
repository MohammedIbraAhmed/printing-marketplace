'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { VerificationQueue } from '@/components/admin/verification-queue'

interface VerificationQueueClientProps {
  verifications: Array<{
    id: string
    userId: string
    businessName: string
    contactName: string
    email: string
    phone?: string
    address: {
      street: string
      city: string
      state: string
      zipCode: string
    }
    businessType: string
    submittedAt: string
    documents: Array<{
      id: string
      type: string
      name: string
      url: string
      uploadedAt: string
      status: 'pending' | 'approved' | 'rejected'
    }>
    status: 'pending' | 'approved' | 'rejected'
    notes?: string
    rejectionReason?: string
  }>
}

export function VerificationQueueClient({ verifications: initialVerifications }: VerificationQueueClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async (verificationId: string, notes?: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: verificationId,
          action: 'approve',
          notes
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to approve verification')
      }

      // Refresh the page to show updated data
      router.refresh()
      
    } catch (error) {
      console.error('Failed to approve verification:', error)
      alert('Failed to approve verification. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleReject = async (verificationId: string, reason: string) => {
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/admin/verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: verificationId,
          action: 'reject',
          rejectionReason: reason
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to reject verification')
      }

      // Refresh the page to show updated data
      router.refresh()
      
    } catch (error) {
      console.error('Failed to reject verification:', error)
      alert('Failed to reject verification. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <VerificationQueue
      verifications={initialVerifications}
      onApprove={handleApprove}
      onReject={handleReject}
      isLoading={isLoading}
    />
  )
}