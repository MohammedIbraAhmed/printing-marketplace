import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { PrintShopVerificationForm } from '@/components/verification/print-shop-verification-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CheckCircle, 
  Clock, 
  XCircle, 
  AlertTriangle,
  Shield,
  FileText,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { PrintShopVerification } from '@/lib/validations/verification'

async function getVerificationStatus(userId: string) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/verification/submit`, {
      headers: {
        'user-id': userId,
      },
    })
    
    if (response.ok) {
      return await response.json()
    }
    
    return { status: 'not_submitted' }
  } catch (error) {
    console.error('Failed to fetch verification status:', error)
    return { status: 'not_submitted' }
  }
}

export default async function VerificationPage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  if (session.user.role !== 'printShop') {
    redirect('/')
  }

  const verificationData = await getVerificationStatus(session.user.id)

  const handleSubmit = async (data: PrintShopVerification) => {
    'use server'
    // This will be handled by the client component
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
      case 'under_review':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>
      case 'under_review':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Under Review</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Rejected</Badge>
      default:
        return <Badge variant="outline">Not Submitted</Badge>
    }
  }

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Your print shop has been verified! You can now receive orders from customers.'
      case 'pending':
        return 'Your verification request has been submitted and is waiting for review.'
      case 'under_review':
        return 'Our team is currently reviewing your verification documents.'
      case 'rejected':
        return 'Your verification request was rejected. Please review the feedback and submit again.'
      default:
        return 'Submit your business information and documents to get verified as a trusted print shop.'
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" asChild>
                <Link href="/profile">
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              </Button>
              <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                  <Shield className="h-8 w-8" />
                  Print Shop Verification
                </h1>
                <p className="text-muted-foreground">
                  Get verified to build trust with customers and increase your business
                </p>
              </div>
            </div>

            {/* Current Status */}
            {verificationData.status !== 'not_submitted' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(verificationData.status)}
                    Verification Status
                    {getStatusBadge(verificationData.status)}
                  </CardTitle>
                  <CardDescription>
                    {getStatusMessage(verificationData.status)}
                  </CardDescription>
                </CardHeader>
                {(verificationData.reviewNotes || verificationData.submittedAt) && (
                  <CardContent className="space-y-4">
                    {verificationData.submittedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Submitted: {new Date(verificationData.submittedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {verificationData.reviewedAt && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Reviewed: {new Date(verificationData.reviewedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {verificationData.reviewNotes && (
                      <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Review Notes:</strong> {verificationData.reviewNotes}
                        </AlertDescription>
                      </Alert>
                    )}
                    {verificationData.expiresAt && verificationData.status === 'approved' && (
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Verification expires: {new Date(verificationData.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Benefits of Verification */}
            {verificationData.status === 'not_submitted' && (
              <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <CardHeader>
                  <CardTitle className="text-blue-800 dark:text-blue-200">
                    Why Get Verified?
                  </CardTitle>
                  <CardDescription className="text-blue-700 dark:text-blue-300">
                    Verification builds trust and helps your print shop stand out.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-blue-800 dark:text-blue-200">
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      Higher ranking in search results
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      Verified badge on your profile
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      Increased customer trust and confidence
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      Access to premium features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 flex-shrink-0" />
                      Priority customer support
                    </li>
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Verification Form or Re-submission */}
            {(verificationData.status === 'not_submitted' || verificationData.status === 'rejected') && (
              <PrintShopVerificationForm
                onSubmit={async (data) => {
                  const response = await fetch('/api/verification/submit', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                  })

                  if (!response.ok) {
                    const error = await response.json()
                    throw new Error(error.error || 'Failed to submit verification')
                  }

                  // Refresh the page to show updated status
                  window.location.reload()
                }}
                existingData={verificationData.status === 'rejected' ? verificationData : undefined}
              />
            )}

            {/* Help Section */}
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Common questions about the verification process
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">What documents do I need?</h4>
                  <p className="text-sm text-muted-foreground">
                    You'll need your business license, tax ID documentation, and insurance certificate. 
                    Additional certifications are optional but recommended.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">How long does verification take?</h4>
                  <p className="text-sm text-muted-foreground">
                    Most verification requests are reviewed within 3-5 business days. 
                    Complex cases may take up to 10 business days.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">What if my verification is rejected?</h4>
                  <p className="text-sm text-muted-foreground">
                    You can resubmit your verification with updated information. 
                    Review the feedback provided and address any issues mentioned.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  )
}