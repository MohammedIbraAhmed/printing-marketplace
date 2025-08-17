'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { printShopProfileSchema, type PrintShopProfile } from '@/lib/validations/profile'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { VerificationBadge } from './verification-badge'
import { 
  Building, 
  MapPin, 
  Phone, 
  Clock, 
  Settings, 
  DollarSign,
  Shield,
  Plus, 
  X, 
  AlertCircle, 
  CheckCircle,
  Globe,
  Mail,
  FileText,
  Printer
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ProfileImageUpload } from './profile-image-upload'

interface PrintShopProfileFormProps {
  user: {
    id: string
    name?: string | null
    email: string
    image?: string | null
    profile?: any
  }
  onSave: (data: PrintShopProfile) => Promise<void>
  isLoading?: boolean
}

const CAPABILITIES = [
  { value: 'black-white-printing', label: 'Black & White Printing' },
  { value: 'color-printing', label: 'Color Printing' },
  { value: 'large-format', label: 'Large Format Printing' },
  { value: 'binding', label: 'Binding Services' },
  { value: 'laminating', label: 'Laminating' },
  { value: 'scanning', label: 'Scanning Services' },
  { value: 'copying', label: 'Copying' },
  { value: 'design-services', label: 'Design Services' },
  { value: 'rush-orders', label: 'Rush Orders' },
  { value: 'pickup-delivery', label: 'Pickup & Delivery' }
]

const BUSINESS_TYPES = [
  { value: 'independent', label: 'Independent Business' },
  { value: 'franchise', label: 'Franchise' },
  { value: 'corporation', label: 'Corporation' }
]

const DAYS_OF_WEEK = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
]

export function PrintShopProfileForm({ user, onSave, isLoading = false }: PrintShopProfileFormProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(user.image || null)

  const form = useForm<PrintShopProfile>({
    resolver: zodResolver(printShopProfileSchema),
    defaultValues: {
      name: user.name || '',
      email: user.email,
      profile: {
        businessInfo: {
          businessName: user.profile?.businessInfo?.businessName || '',
          description: user.profile?.businessInfo?.description || '',
          businessType: user.profile?.businessInfo?.businessType || 'independent',
          taxId: user.profile?.businessInfo?.taxId || '',
          license: user.profile?.businessInfo?.license || '',
          capabilities: user.profile?.businessInfo?.capabilities || [],
          equipment: user.profile?.businessInfo?.equipment || [],
          maxOrderSize: user.profile?.businessInfo?.maxOrderSize || 100,
          averageTurnaround: user.profile?.businessInfo?.averageTurnaround || 24
        },
        location: {
          address: user.profile?.location?.address || '',
          city: user.profile?.location?.city || '',
          state: user.profile?.location?.state || '',
          zipCode: user.profile?.location?.zipCode || '',
          country: user.profile?.location?.country || 'United States',
          coordinates: user.profile?.location?.coordinates
        },
        contact: {
          phone: user.profile?.contact?.phone || '',
          email: user.profile?.contact?.email || '',
          website: user.profile?.contact?.website || ''
        },
        hours: user.profile?.hours || {},
        pricing: user.profile?.pricing || {},
        verification: {
          documents: user.profile?.verification?.documents || [],
          status: user.profile?.verification?.status || 'unverified',
          verifiedAt: user.profile?.verification?.verifiedAt,
          rejectionReason: user.profile?.verification?.rejectionReason
        }
      }
    }
  })

  const { fields: equipmentFields, append: appendEquipment, remove: removeEquipment } = useFieldArray({
    control: form.control,
    name: "profile.businessInfo.equipment"
  })

  const onSubmit = async (data: PrintShopProfile) => {
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

  const addEquipment = () => {
    appendEquipment('')
  }

  const watchedCapabilities = form.watch('profile.businessInfo.capabilities')
  const verificationStatus = form.watch('profile.verification.status')

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
                <Building className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Update your print shop's basic information and branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Image Upload */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Business Logo</h3>
                <ProfileImageUpload
                  currentImageUrl={currentImageUrl}
                  onImageUpdate={setCurrentImageUrl}
                  isLoading={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="John Smith"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.businessInfo.businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="ABC Print Solutions"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Account Email</FormLabel>
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
                name="profile.businessInfo.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Tell customers about your print shop, services, and what makes you special..."
                        className="min-h-[100px]"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground">
                      {form.watch('profile.businessInfo.description')?.length || 0}/1000 characters
                    </p>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="profile.businessInfo.businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {BUSINESS_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.businessInfo.taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID / EIN</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="12-3456789"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.businessInfo.license"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business License</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="BL-123456"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Location
              </CardTitle>
              <CardDescription>
                Your business address helps customers find and visit your shop.
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
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Contact Information
              </CardTitle>
              <CardDescription>
                How customers can reach your business directly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="profile.contact.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Phone</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="+1 (555) 123-4567"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile.contact.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="email"
                        placeholder="contact@yourprintshop.com"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="profile.contact.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        type="url"
                        placeholder="https://yourprintshop.com"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Services & Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Services & Capabilities
              </CardTitle>
              <CardDescription>
                Select the services your print shop offers to customers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="profile.businessInfo.capabilities"
                render={() => (
                  <FormItem>
                    <FormLabel>Capabilities</FormLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {CAPABILITIES.map((capability) => (
                        <FormField
                          key={capability.value}
                          control={form.control}
                          name="profile.businessInfo.capabilities"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={capability.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(capability.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, capability.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value: string) => value !== capability.value
                                            )
                                          )
                                    }}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {capability.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator />

              <div>
                <FormLabel className="text-base font-medium">Equipment</FormLabel>
                <p className="text-sm text-muted-foreground mb-3">List your printing equipment and machines.</p>
                <div className="space-y-2">
                  {equipmentFields.map((field, index) => (
                    <div key={field.id} className="flex gap-2">
                      <FormField
                        control={form.control}
                        name={`profile.businessInfo.equipment.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                {...field} 
                                placeholder="e.g., HP LaserJet Pro 4000, Canon ImagePress C165"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => removeEquipment(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addEquipment}
                  disabled={isLoading}
                  className="w-full mt-2"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Equipment
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="profile.businessInfo.maxOrderSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Order Size (pages)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="1"
                          max="10000"
                          placeholder="100"
                          disabled={isLoading}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="profile.businessInfo.averageTurnaround"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Average Turnaround (hours)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="number"
                          min="1"
                          max="168"
                          placeholder="24"
                          disabled={isLoading}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Verification Status */}
          {verificationStatus && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Verification Status
                </CardTitle>
                <CardDescription>
                  Your business verification status affects your visibility on the platform.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <VerificationBadge status={verificationStatus} size="md" />
                </div>
                
                {verificationStatus === 'unverified' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Complete your business verification to increase customer trust and platform visibility.
                  </p>
                )}

                {verificationStatus === 'rejected' && form.watch('profile.verification.rejectionReason') && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Rejection Reason:</strong> {form.watch('profile.verification.rejectionReason')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

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