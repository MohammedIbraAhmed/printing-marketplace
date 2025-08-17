'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { customerProfileSchema, type CustomerProfile } from '@/lib/validations/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MapPin, Phone, User, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileImageUpload } from './profile-image-upload'

interface CustomerProfileFormProps {
  user: {
    id: string
    name?: string | null
    email: string
    image?: string | null
    profile?: any
  }
  onSave: (data: CustomerProfile) => Promise<void>
  isLoading?: boolean
}

export function CustomerProfileForm({ user, onSave, isLoading = false }: CustomerProfileFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(user.image || null)

  const form = useForm<CustomerProfile>({
    resolver: zodResolver(customerProfileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email,
      profile: {
        location: {
          address: user.profile?.location?.address || '',
          city: user.profile?.location?.city || '',
          state: user.profile?.location?.state || '',
          zipCode: user.profile?.location?.zipCode || '',
          country: user.profile?.location?.country || 'United States',
          coordinates: user.profile?.location?.coordinates
        },
        phone: user.profile?.phone || '',
        preferences: {
          preferredPrintShops: user.profile?.preferences?.preferredPrintShops || [],
          defaultOrderNotes: user.profile?.preferences?.defaultOrderNotes || ''
        }
      }
    }
  })

  const onSubmit = async (data: CustomerProfile) => {
    try {
      setSaveError(null)
      setSaveSuccess(false)
      await onSave(data)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile')
    }
  }

  const hasLocation = form.watch('profile.location.address')

  return (
    <div className="space-y-6">
      {saveError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      {saveSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Profile updated successfully!</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Profile Image</h3>
                <ProfileImageUpload
                  currentImageUrl={currentImageUrl}
                  onImageUpdate={setCurrentImageUrl}
                  isLoading={isLoading}
                />
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Enter your full name"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        disabled={true}
                        className="bg-muted"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact support if you need to update your email.
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                          {...field} 
                          placeholder="+1 (555) 123-4567"
                          className="pl-10"
                          disabled={isLoading}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Information
              </CardTitle>
              <CardDescription>
                Add your location to find nearby print shops and get accurate delivery estimates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="profile.location.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="123 Main Street"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile.location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="San Francisco"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.location.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State/Province</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="California"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile.location.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP/Postal Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="94102"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.location.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="United States"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {hasLocation && (
                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 Your location helps us find nearby print shops and provide accurate delivery estimates.
                    We never share your exact address with print shops until you place an order.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Preferences</CardTitle>
              <CardDescription>
                Customize your printing experience with default settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="profile.preferences.defaultOrderNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Order Notes</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g., Please staple in top-left corner"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      These notes will be automatically added to new orders (you can edit them per order).
                    </p>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
              disabled={isLoading}
            >
              Reset Changes
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className={cn(
                "min-w-[120px]",
                saveSuccess && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isLoading ? 'Saving...' : saveSuccess ? 'Saved!' : 'Save Profile'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}