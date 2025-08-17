'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingStep1Schema, type OnboardingStep1 } from '@/lib/validations/print-shop'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Building2, 
  Phone, 
  CheckCircle, 
  AlertCircle,
  Info 
} from 'lucide-react'

interface BusinessInfoStepProps {
  user: {
    id: string
    name?: string | null
    email: string
  }
  data?: Partial<OnboardingStep1>
  onComplete: (data: OnboardingStep1) => void
  onNext: () => void
  isLoading?: boolean
}

export function BusinessInfoStep({ 
  user, 
  data, 
  onComplete, 
  onNext, 
  isLoading = false 
}: BusinessInfoStepProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const form = useForm<OnboardingStep1>({
    resolver: zodResolver(onboardingStep1Schema),
    defaultValues: {
      businessInfo: {
        displayName: data?.businessInfo?.displayName || '',
        legalName: data?.businessInfo?.legalName || '',
        dbaName: data?.businessInfo?.dbaName || '',
        businessType: data?.businessInfo?.businessType || undefined,
        taxId: data?.businessInfo?.taxId || '',
        yearEstablished: data?.businessInfo?.yearEstablished || new Date().getFullYear(),
        description: data?.businessInfo?.description || '',
        website: data?.businessInfo?.website || '',
        logo: data?.businessInfo?.logo || '',
      },
      contactInfo: {
        businessPhone: data?.contactInfo?.businessPhone || '',
        businessEmail: data?.contactInfo?.businessEmail || user.email,
        supportEmail: data?.contactInfo?.supportEmail || '',
        emergencyContact: data?.contactInfo?.emergencyContact || undefined,
      },
    },
  })

  const [hasEmergencyContact, setHasEmergencyContact] = useState(
    !!data?.contactInfo?.emergencyContact
  )

  const onSubmit = async (formData: OnboardingStep1) => {
    try {
      setSaveError(null)
      setSaveSuccess(false)
      
      // Validate and save step data
      onComplete(formData)
      setSaveSuccess(true)
      
      // Auto-advance after a short delay
      setTimeout(() => {
        onNext()
      }, 1000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save business information')
    }
  }

  const businessTypes = [
    { value: 'sole_proprietorship', label: 'Sole Proprietorship' },
    { value: 'partnership', label: 'Partnership' },
    { value: 'llc', label: 'LLC (Limited Liability Company)' },
    { value: 'corporation', label: 'Corporation' },
    { value: 'other', label: 'Other' },
  ]

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
          <AlertDescription>Business information saved successfully!</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Business Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Details
              </CardTitle>
              <CardDescription>
                Basic information about your print shop business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessInfo.displayName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Display Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="PrintMaster Pro"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        The name customers will see on your shop profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessInfo.legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Business Name *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="PrintMaster Pro LLC"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Official registered business name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessInfo.dbaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DBA Name (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Doing Business As name"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        If you operate under a different name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessInfo.businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {businessTypes.map(type => (
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
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessInfo.taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax ID (EIN/SSN) *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="XX-XXXXXXX"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Your business tax identification number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessInfo.yearEstablished"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Established *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1900"
                          max={new Date().getFullYear()}
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
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
                name="businessInfo.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description *</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field}
                        placeholder="Describe your print shop, services, and what makes you unique..."
                        rows={4}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Tell customers about your business (minimum 50 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessInfo.website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="url"
                        placeholder="https://www.yourprintshop.com"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Your business website or social media page
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                How customers can reach your business
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactInfo.businessPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Phone *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="tel"
                          placeholder="+1 (555) 123-4567"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Primary phone number for customer inquiries
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contactInfo.businessEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Email *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="email"
                          placeholder="contact@yourprintshop.com"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Primary email for business communications
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="contactInfo.supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Email (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field}
                        type="email"
                        placeholder="support@yourprintshop.com"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Dedicated email for customer support (if different from business email)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Emergency Contact Toggle */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="emergency-contact"
                  checked={hasEmergencyContact}
                  onChange={(e) => setHasEmergencyContact(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="emergency-contact" className="text-sm font-medium">
                  Add emergency contact (recommended)
                </label>
              </div>

              {hasEmergencyContact && (
                <Card className="border-2 border-dashed border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base">Emergency Contact</CardTitle>
                    <CardDescription>
                      Someone to contact if there are urgent issues with your shop
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactInfo.emergencyContact.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Name</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                placeholder="John Doe"
                                disabled={isLoading}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactInfo.emergencyContact.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Phone</FormLabel>
                            <FormControl>
                              <Input 
                                {...field}
                                type="tel"
                                placeholder="+1 (555) 987-6543"
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
                      name="contactInfo.emergencyContact.relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relationship</FormLabel>
                          <FormControl>
                            <Input 
                              {...field}
                              placeholder="Owner, Manager, Business Partner, etc."
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>

          {/* Info box */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Note:</strong> Your tax ID and emergency contact information 
              are kept private and only used for verification and emergency purposes. 
              Only your business name, description, and primary contact details will be 
              visible to customers.
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