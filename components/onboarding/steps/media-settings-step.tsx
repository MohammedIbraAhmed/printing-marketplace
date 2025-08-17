'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingStep5Schema, type OnboardingStep5 } from '@/lib/validations/print-shop'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Camera, 
  Image, 
  Settings,
  Shield,
  CheckCircle, 
  AlertCircle,
  Info,
  Plus,
  X
} from 'lucide-react'

interface MediaSettingsStepProps {
  user: {
    id: string
    name?: string | null
    email: string
  }
  data?: Partial<OnboardingStep5>
  onComplete: (data: OnboardingStep5) => void
  onNext: () => void
  isLoading?: boolean
}

const PHOTO_CATEGORIES = [
  { value: 'interior', label: 'Interior Photos' },
  { value: 'exterior', label: 'Exterior Photos' },
  { value: 'equipment', label: 'Equipment Photos' },
  { value: 'samples', label: 'Sample Work' },
  { value: 'staff', label: 'Staff Photos' },
]

const COMMUNICATION_PREFERENCES = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'sms', label: 'SMS/Text' },
  { value: 'app', label: 'In-App Messages' },
]

export function MediaSettingsStep({ 
  user, 
  data, 
  onComplete, 
  onNext, 
  isLoading = false 
}: MediaSettingsStepProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const form = useForm<OnboardingStep5>({
    resolver: zodResolver(onboardingStep5Schema),
    defaultValues: {
      media: {
        shopPhotos: data?.media?.shopPhotos || [],
        sampleWork: data?.media?.sampleWork || [],
        videos: data?.media?.videos || [],
      },
      customerSettings: {
        acceptsWalkIns: data?.customerSettings?.acceptsWalkIns ?? true,
        requiresAppointment: data?.customerSettings?.requiresAppointment ?? false,
        onlineOrderingEnabled: data?.customerSettings?.onlineOrderingEnabled ?? true,
        autoAcceptOrders: data?.customerSettings?.autoAcceptOrders ?? false,
        communicationPreferences: data?.customerSettings?.communicationPreferences || ['email'],
        responseTimeGuarantee: data?.customerSettings?.responseTimeGuarantee || '',
      },
      quality: {
        qualityGuarantee: data?.quality?.qualityGuarantee || '',
        returnPolicy: data?.quality?.returnPolicy || '',
        certifications: data?.quality?.certifications || [],
        insuranceAmount: data?.quality?.insuranceAmount || 0,
        bondedAmount: data?.quality?.bondedAmount || 0,
      },
    },
  })

  const { fields: shopPhotoFields, append: appendShopPhoto, remove: removeShopPhoto } = useFieldArray({
    control: form.control,
    name: 'media.shopPhotos',
  })

  const { fields: sampleWorkFields, append: appendSampleWork, remove: removeSampleWork } = useFieldArray({
    control: form.control,
    name: 'media.sampleWork',
  })

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: 'quality.certifications',
  })

  const onSubmit = async (formData: OnboardingStep5) => {
    try {
      setSaveError(null)
      setSaveSuccess(false)
      
      onComplete(formData)
      setSaveSuccess(true)
      
      setTimeout(() => {
        onNext()
      }, 1000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save media and settings')
    }
  }

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
          <AlertDescription>Media and settings saved successfully!</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Shop Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Shop Photos (Optional)
              </CardTitle>
              <CardDescription>
                Add photos of your shop to help customers find you and see your facilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Photos help build trust and showcase your professional space
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendShopPhoto({ url: '', caption: '', isMain: false, category: 'interior' })}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Photo
                </Button>
              </div>

              {shopPhotoFields.map((field, index) => (
                <Card key={field.id} className="border-2 border-dashed border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">Photo {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeShopPhoto(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`media.shopPhotos.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Photo URL *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="https://example.com/photo.jpg"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Upload to an image hosting service first
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`media.shopPhotos.${index}.category`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {PHOTO_CATEGORIES.map(category => (
                                  <SelectItem key={category.value} value={category.value}>
                                    {category.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-3 space-y-3">
                      <FormField
                        control={form.control}
                        name={`media.shopPhotos.${index}.caption`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Caption</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Describe what's shown in this photo"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`media.shopPhotos.${index}.isMain`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={isLoading}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-xs">Main photo for shop profile</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {shopPhotoFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No photos added yet. Photos help customers trust your business.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sample Work */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                Sample Work (Optional)
              </CardTitle>
              <CardDescription>
                Showcase examples of your printing work to attract customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Show potential customers the quality of your work
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendSampleWork({ url: '', title: '', description: '', serviceType: '' })}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sample
                </Button>
              </div>

              {sampleWorkFields.map((field, index) => (
                <Card key={field.id} className="border-2 border-dashed border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">Sample {index + 1}</h4>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeSampleWork(index)}
                        disabled={isLoading}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name={`media.sampleWork.${index}.url`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Sample Image URL *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="https://example.com/sample.jpg"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`media.sampleWork.${index}.title`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Title *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Business Card Design"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-3 space-y-3">
                      <FormField
                        control={form.control}
                        name={`media.sampleWork.${index}.serviceType`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Service Type *</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="Business Cards, Flyers, Posters, etc."
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`media.sampleWork.${index}.description`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs">Description</FormLabel>
                            <FormControl>
                              <Textarea 
                                {...field}
                                placeholder="Describe the project, materials used, special techniques..."
                                rows={2}
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
              ))}

              {sampleWorkFields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Image className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No sample work added yet. Showcase your best projects.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customer Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Customer Interaction Settings
              </CardTitle>
              <CardDescription>
                Configure how customers can interact with your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerSettings.acceptsWalkIns"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Accept Walk-in Customers</FormLabel>
                        <FormDescription>
                          Customers can visit without an appointment
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerSettings.requiresAppointment"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Require Appointments</FormLabel>
                        <FormDescription>
                          Customers must schedule appointments for visits
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerSettings.onlineOrderingEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Enable Online Ordering</FormLabel>
                        <FormDescription>
                          Allow customers to place orders through the platform
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customerSettings.autoAcceptOrders"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Auto-Accept Orders</FormLabel>
                        <FormDescription>
                          Automatically accept orders that meet your criteria
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="customerSettings.communicationPreferences"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Communication Preferences</FormLabel>
                      <FormDescription>
                        How you prefer to communicate with customers
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {COMMUNICATION_PREFERENCES.map((pref) => (
                        <FormField
                          key={pref.value}
                          control={form.control}
                          name="customerSettings.communicationPreferences"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={pref.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(pref.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, pref.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== pref.value
                                            )
                                          )
                                    }}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {pref.label}
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

              <FormField
                control={form.control}
                name="customerSettings.responseTimeGuarantee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Response Time Guarantee</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        placeholder="2 hours, Same day, 24 hours"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      How quickly you guarantee to respond to customer inquiries
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Quality & Certifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Quality Assurance (Optional)
              </CardTitle>
              <CardDescription>
                Add quality guarantees and professional certifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <FormField
                control={form.control}
                name="quality.qualityGuarantee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quality Guarantee</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Describe your quality standards and guarantees..."
                        rows={3}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell customers about your quality standards and what you guarantee
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quality.returnPolicy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Return Policy</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Describe your return and refund policy..."
                        rows={3}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Explain your policy for returns, refunds, and reprints
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quality.insuranceAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Coverage ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          step="1000"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Amount of business insurance coverage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quality.bondedAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bonded Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="0"
                          step="1000"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Amount of business bonding
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Certifications */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Professional Certifications</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendCertification({ name: '', issuingBody: '', expirationDate: '', certificateUrl: '' })}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Certification
                  </Button>
                </div>
                <FormDescription>
                  Add any professional certifications or industry credentials
                </FormDescription>

                {certificationFields.map((field, index) => (
                  <Card key={field.id} className="border-2 border-dashed border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Certification {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCertification(index)}
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`quality.certifications.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Certification Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="ISO 9001, Industry Certification"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`quality.certifications.${index}.issuingBody`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Issuing Organization *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="ISO, Industry Association"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`quality.certifications.${index}.expirationDate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Expiration Date</FormLabel>
                              <FormControl>
                                <Input 
                                  type="date"
                                  {...field}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`quality.certifications.${index}.certificateUrl`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Certificate URL</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="https://example.com/certificate.pdf"
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
                ))}

                {certificationFields.length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <Shield className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No certifications added yet.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Info box */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Optional Step:</strong> This step helps build trust with customers but 
              isn&apos;t required to complete your shop setup. You can always add photos, 
              samples, and certifications later in your shop management dashboard.
            </AlertDescription>
          </Alert>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isLoading}
              className="min-w-[120px]"
            >
              {isLoading ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}