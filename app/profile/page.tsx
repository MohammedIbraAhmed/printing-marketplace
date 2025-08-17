import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  User, 
  MapPin, 
  Mail, 
  Phone, 
  Calendar, 
  Edit, 
  Shield,
  Award,
  Globe,
  Building
} from 'lucide-react'
import Link from 'next/link'
import { User as UserModel } from '@/lib/models'
import connectToDatabase from '@/lib/database'

async function getUserProfile(userId: string) {
  await connectToDatabase()
  const user = await UserModel.findById(userId).select('-password').lean()
  return user
}

export default async function ProfilePage() {
  const session = await auth()
  
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }

  const user = await getUserProfile(session.user.id)
  
  if (!user) {
    redirect('/auth/signin')
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'customer': return 'Customer'
      case 'creator': return 'Content Creator'
      case 'printShop': return 'Print Shop'
      case 'admin': return 'Administrator'
      default: return role
    }
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive'
      case 'creator': return 'default'
      case 'printShop': return 'secondary'
      default: return 'outline'
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-4xl">
          <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">My Profile</h1>
                <p className="text-muted-foreground">
                  Manage your account information and preferences
                </p>
              </div>
              <Button asChild>
                <Link href="/profile/edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
            </div>

            {/* Profile Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  {/* Avatar */}
                  <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                    {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Basic Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{user.name || 'No name set'}</h2>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                      {user.profile?.isVerified && (
                        <Badge variant="default" className="bg-green-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Member since {formatDate(user.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-Specific Information */}
            {user.role === 'customer' && user.profile?.location && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p>{user.profile.location.address}</p>
                    <p>{user.profile.location.city}, {user.profile.location.state} {user.profile.location.zipCode}</p>
                    <p>{user.profile.location.country}</p>
                  </div>
                  {user.profile.phone && (
                    <div className="flex items-center gap-2 mt-3 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <span>{user.profile.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {user.role === 'creator' && (
              <>
                {user.profile?.bio && (
                  <Card>
                    <CardHeader>
                      <CardTitle>About</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{user.profile.bio}</p>
                    </CardContent>
                  </Card>
                )}
                
                {user.profile?.specializations && user.profile.specializations.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Specializations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {user.profile.specializations.map((spec: string, index: number) => (
                          <Badge key={index} variant="secondary">{spec}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.profile?.education && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Award className="h-5 w-5" />
                        Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {user.profile.education.degree && <p className="font-medium">{user.profile.education.degree}</p>}
                        {user.profile.education.institution && <p className="text-muted-foreground">{user.profile.education.institution}</p>}
                        {user.profile.education.graduationYear && <p className="text-sm text-muted-foreground">Graduated {user.profile.education.graduationYear}</p>}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {user.profile?.socialMedia && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        Online Presence
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {user.profile.socialMedia.website && (
                          <a href={user.profile.socialMedia.website} target="_blank" rel="noopener noreferrer" 
                             className="text-primary hover:underline block">
                            Website: {user.profile.socialMedia.website}
                          </a>
                        )}
                        {user.profile.socialMedia.linkedin && (
                          <a href={user.profile.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" 
                             className="text-primary hover:underline block">
                            LinkedIn: {user.profile.socialMedia.linkedin}
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {user.role === 'printShop' && user.profile?.businessInfo && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-medium">{user.profile.businessInfo.businessName}</h3>
                      <p className="text-muted-foreground">{user.profile.businessInfo.description}</p>
                    </div>
                    
                    {user.profile.businessInfo.capabilities && (
                      <div>
                        <h4 className="font-medium mb-2">Capabilities</h4>
                        <div className="flex flex-wrap gap-2">
                          {user.profile.businessInfo.capabilities.map((cap: string, index: number) => (
                            <Badge key={index} variant="outline">{cap.replace('-', ' ')}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common profile and account management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/profile/edit">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Link>
                  </Button>
                  
                  <Button variant="outline" asChild>
                    <Link href="/settings">
                      <User className="h-4 w-4 mr-2" />
                      Account Settings
                    </Link>
                  </Button>
                  
                  {user.role === 'creator' && (
                    <Button variant="outline" asChild>
                      <Link href="/creator/upload">
                        <Award className="h-4 w-4 mr-2" />
                        Upload Content
                      </Link>
                    </Button>
                  )}
                  
                  {user.role === 'printShop' && (
                    <Button variant="outline" asChild>
                      <Link href="/shop-dashboard">
                        <Building className="h-4 w-4 mr-2" />
                        Shop Dashboard
                      </Link>
                    </Button>
                  )}
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