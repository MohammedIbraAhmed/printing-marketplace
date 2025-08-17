'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { 
  Check, 
  X, 
  Eye, 
  FileText, 
  Calendar, 
  Building, 
  Mail,
  Phone,
  MapPin,
  AlertCircle,
  CheckCircle,
  Clock,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface VerificationDocument {
  id: string
  type: string
  name: string
  url: string
  uploadedAt: string
  status: 'pending' | 'approved' | 'rejected'
}

interface PendingVerification {
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
  documents: VerificationDocument[]
  status: 'pending' | 'approved' | 'rejected'
  notes?: string
  rejectionReason?: string
}

interface VerificationQueueProps {
  verifications: PendingVerification[]
  onApprove: (verificationId: string, notes?: string) => Promise<void>
  onReject: (verificationId: string, reason: string) => Promise<void>
  isLoading?: boolean
}

export function VerificationQueue({ 
  verifications, 
  onApprove, 
  onReject, 
  isLoading = false 
}: VerificationQueueProps) {
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [processing, setProcessing] = useState<string | null>(null)

  const handleAction = async () => {
    if (!selectedVerification || !actionType) return

    setProcessing(selectedVerification)
    
    try {
      if (actionType === 'approve') {
        await onApprove(selectedVerification, notes)
      } else {
        await onReject(selectedVerification, rejectionReason)
      }
      
      // Reset state
      setSelectedVerification(null)
      setActionType(null)
      setNotes('')
      setRejectionReason('')
    } catch (error) {
      console.error('Action failed:', error)
    } finally {
      setProcessing(null)
    }
  }

  const resetAction = () => {
    setSelectedVerification(null)
    setActionType(null)
    setNotes('')
    setRejectionReason('')
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending Review</Badge>
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Print Shop Verification Queue</h2>
          <p className="text-muted-foreground">
            Review and approve print shop verification requests
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-3 py-1">
            {verifications.filter(v => v.status === 'pending').length} Pending
          </Badge>
        </div>
      </div>

      {verifications.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No verification requests pending review.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {verifications.map((verification) => (
            <Card key={verification.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      {verification.businessName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {verification.contactName}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(verification.submittedAt)}
                      </span>
                    </CardDescription>
                  </div>
                  {getStatusBadge(verification.status)}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Business Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Contact Information</h4>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <a href={`mailto:${verification.email}`} className="hover:underline">
                          {verification.email}
                        </a>
                      </div>
                      {verification.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <a href={`tel:${verification.phone}`} className="hover:underline">
                            {verification.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Business Address</h4>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div>{verification.address.street}</div>
                        <div>
                          {verification.address.city}, {verification.address.state} {verification.address.zipCode}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Type */}
                <div>
                  <span className="text-sm font-medium">Business Type: </span>
                  <Badge variant="outline" className="capitalize">
                    {verification.businessType.replace('_', ' ')}
                  </Badge>
                </div>

                {/* Documents */}
                <div>
                  <h4 className="font-medium text-sm mb-2">Submitted Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {verification.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-2 p-2 border rounded-lg bg-muted/50"
                      >
                        <FileText className="w-4 h-4" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{doc.name}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {doc.type.replace('_', ' ')}
                          </div>
                        </div>
                        <Link href={doc.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Existing Notes */}
                {verification.notes && (
                  <div>
                    <h4 className="font-medium text-sm mb-2">Previous Notes</h4>
                    <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                      {verification.notes}
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {verification.status === 'rejected' && verification.rejectionReason && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Rejection Reason:</strong> {verification.rejectionReason}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Action Buttons */}
                {verification.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="default"
                      onClick={() => {
                        setSelectedVerification(verification.id)
                        setActionType('approve')
                      }}
                      disabled={isLoading || processing === verification.id}
                      className="flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedVerification(verification.id)
                        setActionType('reject')
                      }}
                      disabled={isLoading || processing === verification.id}
                      className="flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {selectedVerification && actionType && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>
                {actionType === 'approve' ? 'Approve Verification' : 'Reject Verification'}
              </CardTitle>
              <CardDescription>
                {actionType === 'approve' 
                  ? 'Add any notes for this approval (optional)'
                  : 'Please provide a reason for rejection'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {actionType === 'approve' ? (
                <div>
                  <label className="text-sm font-medium">Notes (Optional)</label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about this verification..."
                    className="mt-1"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-sm font-medium">Rejection Reason *</label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Explain why this verification is being rejected..."
                    className="mt-1"
                    required
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={resetAction}
                  disabled={processing === selectedVerification}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={
                    processing === selectedVerification || 
                    (actionType === 'reject' && !rejectionReason.trim())
                  }
                  className={cn(
                    "flex-1",
                    actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  )}
                >
                  {processing === selectedVerification ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-background border-t-foreground" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === 'approve' ? (
                        <><Check className="w-4 h-4 mr-2" />Approve</>
                      ) : (
                        <><X className="w-4 h-4 mr-2" />Reject</>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}