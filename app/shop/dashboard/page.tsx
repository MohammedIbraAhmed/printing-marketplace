import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import connectToDatabase from '@/lib/database'
import { User as UserModel } from '@/lib/models'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Store, 
  Users, 
  DollarSign, 
  Package,
  Settings,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Shop Dashboard - PrintMarket',
  description: 'Manage your print shop and orders',
}

async function getShopData(userId: string) {
  try {
    await connectToDatabase()
    
    const user = await UserModel.findById(userId).select('name email profile onboarding role').lean()
    
    if (!user) {
      return null
    }
    
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile,
      onboarding: user.onboarding,
    }
  } catch (error) {
    console.error('Error fetching shop data:', error)
    return null
  }
}

export default async function ShopDashboardPage({
  searchParams,
}: {
  searchParams: { onboarding?: string }
}) {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/shop/dashboard')
  }
  
  const shopData = await getShopData(session.user.id)
  
  if (!shopData) {
    redirect('/auth/signin?callbackUrl=/shop/dashboard')
  }
  
  if (shopData.role !== 'printShop') {
    redirect('/dashboard?error=unauthorized')
  }
  
  // Check if onboarding needs to be completed
  if (!shopData.onboarding?.completed) {
    redirect('/onboarding/print-shop')
  }
  
  const isOnboardingComplete = searchParams.onboarding === 'complete'
  const alreadyComplete = searchParams.onboarding === 'already-complete'
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome, {shopData.profile?.businessInfo?.displayName || shopData.name}!
              </h1>
              <p className="text-gray-600">
                Manage your print shop and view order analytics
              </p>
            </div>
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              <Store className="h-4 w-4 mr-1" />
              Print Shop
            </Badge>
          </div>
          
          {isOnboardingComplete && (
            <Alert className="border-green-200 bg-green-50 text-green-800 mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Congratulations!</strong> Your print shop onboarding is complete. 
                Your shop is now active and customers can find you in the directory.
              </AlertDescription>
            </Alert>
          )}
          
          {alreadyComplete && (
            <Alert className="border-blue-200 bg-blue-50 text-blue-800 mb-6">
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                Your print shop onboarding was already completed. Welcome back to your dashboard!
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                No orders yet
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                Build your customer base
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$0.00</div>
              <p className="text-xs text-muted-foreground">
                Start accepting orders
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shop Rating</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">
                No reviews yet
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Shop Profile Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Shop Profile
              </CardTitle>
              <CardDescription>
                Your business information and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm font-medium">Business Name</p>
                <p className="text-sm text-gray-600">
                  {shopData.profile?.businessInfo?.displayName || 'Not set'}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Location</p>
                <p className="text-sm text-gray-600">
                  {shopData.profile?.location?.address?.city && shopData.profile?.location?.address?.state
                    ? `${shopData.profile.location.address.city}, ${shopData.profile.location.address.state}`
                    : 'Not set'
                  }
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Services</p>
                <p className="text-sm text-gray-600">
                  {shopData.profile?.services?.coreServices?.length
                    ? `${shopData.profile.services.coreServices.length} services offered`
                    : 'Not configured'
                  }
                </p>
              </div>
              
              <div className="pt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/shop/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Next steps to grow your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm">Complete shop onboarding</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  <span className="text-sm text-gray-600">Add shop photos</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  <span className="text-sm text-gray-600">Upload sample work</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  <span className="text-sm text-gray-600">Optimize pricing</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  <span className="text-sm text-gray-600">Promote your shop</span>
                </div>
              </div>
              
              <div className="pt-3">
                <Button size="sm" asChild>
                  <Link href="/shop/guide">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Growth Guide
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest orders and customer interactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No recent activity yet.</p>
              <p className="text-xs text-gray-400 mt-1">
                Orders and customer messages will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}