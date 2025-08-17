'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingStep4Schema, type OnboardingStep4 } from '@/lib/validations/print-shop'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DollarSign, 
  Users,
  CheckCircle, 
  AlertCircle,
  Info,
  Plus,
  X
} from 'lucide-react'

interface PricingCapacityStepProps {
  user: {
    id: string
    name?: string | null
    email: string
  }
  data?: Partial<OnboardingStep4>
  onComplete: (data: OnboardingStep4) => void
  onNext: () => void
  isLoading?: boolean
}

const PRICING_MODELS = [
  { value: 'per_page', label: 'Per Page', description: 'Charge based on number of pages printed' },
  { value: 'per_job', label: 'Per Job', description: 'Fixed price per printing job' },
  { value: 'per_hour', label: 'Per Hour', description: 'Hourly rate for design and printing time' },
  { value: 'custom', label: 'Custom Quote', description: 'Provide custom quotes for each job' },
]

export function PricingCapacityStep({ 
  user, 
  data, 
  onComplete, 
  onNext, 
  isLoading = false 
}: PricingCapacityStepProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const form = useForm<OnboardingStep4>({
    resolver: zodResolver(onboardingStep4Schema),
    defaultValues: {
      pricing: {
        pricingModel: data?.pricing?.pricingModel || 'per_page',
        baseRates: data?.pricing?.baseRates || {
          blackWhite: {
            singleSided: 0.10,
            doubleSided: 0.15,
          },
          color: {
            singleSided: 0.25,
            doubleSided: 0.45,
          },
        },
        volumeDiscounts: data?.pricing?.volumeDiscounts || [
          { minimumQuantity: 100, discountPercentage: 5 },
          { minimumQuantity: 500, discountPercentage: 10 },
        ],
        additionalFees: data?.pricing?.additionalFees || {
          binding: 2.00,
          lamination: 1.50,
          cutting: 0.50,
          rush: 5.00,
          delivery: 3.00,
        },
        minimumOrder: data?.pricing?.minimumOrder || {
          amount: 5.00,
          pages: 1,
        },
        providesQuotes: data?.pricing?.providesQuotes ?? true,
        quoteTurnaround: data?.pricing?.quoteTurnaround || '24 hours',
      },
      capacity: {
        maxDailyJobs: data?.capacity?.maxDailyJobs || 50,
        maxWeeklyJobs: data?.capacity?.maxWeeklyJobs || 300,
        currentWorkload: data?.capacity?.currentWorkload || 0,
        acceptingOrders: data?.capacity?.acceptingOrders ?? true,
        emergencyCapacity: data?.capacity?.emergencyCapacity ?? false,
        peakHours: data?.capacity?.peakHours || [],
      },
    },
  })

  const { fields: volumeDiscountFields, append: appendVolumeDiscount, remove: removeVolumeDiscount } = useFieldArray({
    control: form.control,
    name: 'pricing.volumeDiscounts',
  })

  // Peak hours functionality can be added later if needed

  const onSubmit = async (formData: OnboardingStep4) => {
    try {
      setSaveError(null)
      setSaveSuccess(false)
      
      onComplete(formData)
      setSaveSuccess(true)
      
      setTimeout(() => {
        onNext()
      }, 1000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save pricing and capacity')
    }
  }

  const selectedPricingModel = form.watch('pricing.pricingModel')

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
          <AlertDescription>Pricing and capacity saved successfully!</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Pricing Model */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pricing Structure
              </CardTitle>
              <CardDescription>
                Define how you charge customers for your services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <FormField
                control={form.control}
                name="pricing.pricingModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base">Pricing Model *</FormLabel>
                    <FormDescription>
                      Choose your primary pricing approach
                    </FormDescription>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PRICING_MODELS.map((model) => (
                        <div key={model.value} className="relative">
                          <FormControl>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id={model.value}
                                value={model.value}
                                checked={field.value === model.value}
                                onChange={field.onChange}
                                className="w-4 h-4 text-blue-600"
                                disabled={isLoading}
                              />
                              <div>
                                <label htmlFor={model.value} className="text-sm font-medium cursor-pointer">
                                  {model.label}
                                </label>
                                <p className="text-xs text-gray-500">{model.description}</p>
                              </div>
                            </div>
                          </FormControl>
                        </div>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Base Rates - Only show for per_page model */}
              {selectedPricingModel === 'per_page' && (
                <div className="space-y-4">
                  <FormLabel className="text-base">Base Rates (per page)</FormLabel>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="border-2 border-dashed border-gray-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm mb-3">Black & White Printing</h4>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="pricing.baseRates.blackWhite.singleSided"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Single-Sided ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="pricing.baseRates.blackWhite.doubleSided"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Double-Sided ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
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

                    <Card className="border-2 border-dashed border-gray-200">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-sm mb-3">Color Printing</h4>
                        <div className="space-y-3">
                          <FormField
                            control={form.control}
                            name="pricing.baseRates.color.singleSided"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Single-Sided ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="pricing.baseRates.color.doubleSided"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-xs">Double-Sided ($)</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    {...field}
                                    onChange={e => field.onChange(parseFloat(e.target.value))}
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
                  </div>
                </div>
              )}

              {/* Volume Discounts */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Volume Discounts</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendVolumeDiscount({ minimumQuantity: 100, discountPercentage: 5 })}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Discount
                  </Button>
                </div>
                <FormDescription>
                  Offer discounts for larger orders to encourage bulk printing
                </FormDescription>

                {volumeDiscountFields.map((field, index) => (
                  <Card key={field.id} className="border-2 border-dashed border-green-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Discount Tier {index + 1}</h4>
                        {volumeDiscountFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVolumeDiscount(index)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name={`pricing.volumeDiscounts.${index}.minimumQuantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Minimum Quantity</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="1"
                                  {...field}
                                  onChange={e => field.onChange(parseInt(e.target.value))}
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`pricing.volumeDiscounts.${index}.discountPercentage`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Discount (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="100"
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
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Fees */}
              <div className="space-y-4">
                <FormLabel className="text-base">Additional Service Fees ($)</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="pricing.additionalFees.binding"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Binding Fee</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing.additionalFees.lamination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Lamination Fee</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing.additionalFees.cutting"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Cutting Fee</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing.additionalFees.rush"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Rush Fee</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing.additionalFees.delivery"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Delivery Fee</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Minimum Order */}
              <div className="space-y-3">
                <FormLabel className="text-base">Minimum Order Requirements</FormLabel>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="pricing.minimumOrder.amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Minimum Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            step="0.01"
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Minimum order value to process
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pricing.minimumOrder.pages"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Minimum Pages</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            {...field}
                            onChange={e => field.onChange(parseInt(e.target.value))}
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Minimum number of pages per order
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Quote Settings */}
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="pricing.providesQuotes"
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
                        <FormLabel>Provide Custom Quotes</FormLabel>
                        <FormDescription>
                          Offer custom quotes for complex or large orders
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('pricing.providesQuotes') && (
                  <FormField
                    control={form.control}
                    name="pricing.quoteTurnaround"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Quote Turnaround Time</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            placeholder="24 hours, 2 business days"
                            disabled={isLoading}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          How quickly you provide custom quotes
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Capacity Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Capacity & Availability
              </CardTitle>
              <CardDescription>
                Manage your shop&apos;s capacity and availability settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity.maxDailyJobs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Daily Jobs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of jobs you can handle per day
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity.maxWeeklyJobs"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Weekly Jobs</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          min="1"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormDescription>
                        Maximum number of jobs you can handle per week
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="capacity.currentWorkload"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Workload (%)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormDescription>
                      Your current capacity utilization (0-100%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="capacity.acceptingOrders"
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
                        <FormLabel>Currently Accepting Orders</FormLabel>
                        <FormDescription>
                          Allow new customers to place orders
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="capacity.emergencyCapacity"
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
                        <FormLabel>Emergency Capacity Available</FormLabel>
                        <FormDescription>
                          Can handle urgent orders beyond normal capacity
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Info box */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Pricing Tip:</strong> Start with competitive rates and adjust based on 
              market response. You can always update your pricing in the shop settings later. 
              Consider your costs for materials, labor, equipment, and desired profit margin.
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