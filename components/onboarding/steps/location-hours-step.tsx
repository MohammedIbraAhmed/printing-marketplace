'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingStep2Schema, type OnboardingStep2 } from '@/lib/validations/print-shop'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  MapPin, 
  Clock, 
  Truck,
  CheckCircle, 
  AlertCircle,
  Info
} from 'lucide-react'

interface LocationHoursStepProps {
  user: {
    id: string
    name?: string | null
    email: string
  }
  data?: Partial<OnboardingStep2>
  onComplete: (data: OnboardingStep2) => void
  onNext: () => void
  isLoading?: boolean
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
] as const

export function LocationHoursStep({ 
  user, 
  data, 
  onComplete, 
  onNext, 
  isLoading = false 
}: LocationHoursStepProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const form = useForm<OnboardingStep2>({
    resolver: zodResolver(onboardingStep2Schema),
    defaultValues: {
      location: {
        address: {
          streetAddress: data?.location?.address?.streetAddress || '',
          addressLine2: data?.location?.address?.addressLine2 || '',
          city: data?.location?.address?.city || '',
          state: data?.location?.address?.state || '',
          zipCode: data?.location?.address?.zipCode || '',
          country: data?.location?.address?.country || 'United States',
        },
        serviceRadius: data?.location?.serviceRadius || 25,
        pickupAvailable: data?.location?.pickupAvailable ?? true,
        deliveryAvailable: data?.location?.deliveryAvailable ?? false,
        shippingAvailable: data?.location?.shippingAvailable ?? true,
      },
      businessHours: {
        timezone: data?.businessHours?.timezone || 'America/New_York',
        schedule: {
          monday: data?.businessHours?.schedule?.monday || { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          tuesday: data?.businessHours?.schedule?.tuesday || { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          wednesday: data?.businessHours?.schedule?.wednesday || { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          thursday: data?.businessHours?.schedule?.thursday || { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          friday: data?.businessHours?.schedule?.friday || { isOpen: true, openTime: '09:00', closeTime: '17:00' },
          saturday: data?.businessHours?.schedule?.saturday || { isOpen: false },
          sunday: data?.businessHours?.schedule?.sunday || { isOpen: false },
        },
        specialHours: data?.businessHours?.specialHours || [],
        holidayClosures: data?.businessHours?.holidayClosures || [],
      },
    },
  })

  const onSubmit = async (formData: OnboardingStep2) => {
    try {
      setSaveError(null)
      setSaveSuccess(false)
      
      onComplete(formData)
      setSaveSuccess(true)
      
      setTimeout(() => {
        onNext()
      }, 1000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save location and hours')
    }
  }

  const timezones = [
    { value: 'America/New_York', label: 'Eastern Time' },
    { value: 'America/Chicago', label: 'Central Time' },
    { value: 'America/Denver', label: 'Mountain Time' },
    { value: 'America/Los_Angeles', label: 'Pacific Time' },
    { value: 'America/Anchorage', label: 'Alaska Time' },
    { value: 'Pacific/Honolulu', label: 'Hawaii Time' },
  ]

  const copyHoursToAll = (dayKey: string) => {
    const sourceDay = form.getValues(`businessHours.schedule.${dayKey as keyof typeof form.formState.defaultValues.businessHours.schedule}`)
    
    DAYS_OF_WEEK.forEach(day => {
      if (day.key !== dayKey) {
        form.setValue(`businessHours.schedule.${day.key}`, sourceDay)
      }
    })
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
          <AlertDescription>Location and hours saved successfully!</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Business Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Address
              </CardTitle>
              <CardDescription>
                Your physical business location where customers can visit
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="location.address.streetAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address *</FormLabel>
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

              <FormField
                control={form.control}
                name="location.address.addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Suite 100, Building B"
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="location.address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="New York"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="NY"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.address.zipCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ZIP Code *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="10001"
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
                name="location.address.country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select country" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="United States">United States</SelectItem>
                        <SelectItem value="Canada">Canada</SelectItem>
                        <SelectItem value="Mexico">Mexico</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Service Area & Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Service Area & Delivery Options
              </CardTitle>
              <CardDescription>
                Define your service radius and available delivery methods
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="location.serviceRadius"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Radius (miles) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        max="500"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      How far from your location will you provide services?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <p className="text-sm font-medium">Available Service Options:</p>
                
                <FormField
                  control={form.control}
                  name="location.pickupAvailable"
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
                        <FormLabel>Customer Pickup</FormLabel>
                        <FormDescription>
                          Customers can pick up orders at your location
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.deliveryAvailable"
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
                        <FormLabel>Local Delivery</FormLabel>
                        <FormDescription>
                          You provide local delivery service
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location.shippingAvailable"
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
                        <FormLabel>Shipping Available</FormLabel>
                        <FormDescription>
                          You can ship orders via postal service or courier
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Business Hours */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Business Hours
              </CardTitle>
              <CardDescription>
                Set your operating hours for each day of the week
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessHours.timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Timezone *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timezones.map(tz => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => (
                  <Card key={day.key} className="border-2 border-dashed border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">{day.label}</h4>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => copyHoursToAll(day.key)}
                            disabled={isLoading}
                          >
                            Copy to All
                          </Button>
                          <FormField
                            control={form.control}
                            name={`businessHours.schedule.${day.key}.isOpen`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm">Open</FormLabel>
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      {form.watch(`businessHours.schedule.${day.key}.isOpen`) && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <FormField
                            control={form.control}
                            name={`businessHours.schedule.${day.key}.openTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Open Time</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time"
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
                            name={`businessHours.schedule.${day.key}.closeTime`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Close Time</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time"
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
                            name={`businessHours.schedule.${day.key}.breakStart`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Break Start</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time"
                                    {...field}
                                    placeholder="Optional"
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`businessHours.schedule.${day.key}.breakEnd`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Break End</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="time"
                                    {...field}
                                    placeholder="Optional"
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Info box */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> You can add special hours and holiday closures later 
              in your shop settings. The basic schedule above will be used for regular 
              business operations and customer expectations.
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