'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { onboardingStep3Schema, type OnboardingStep3 } from '@/lib/validations/print-shop'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Printer, 
  Package,
  CheckCircle, 
  AlertCircle,
  Plus,
  X
} from 'lucide-react'

interface EquipmentServicesStepProps {
  user: {
    id: string
    name?: string | null
    email: string
  }
  data?: Partial<OnboardingStep3>
  onComplete: (data: OnboardingStep3) => void
  onNext: () => void
  isLoading?: boolean
}

const PRINTER_TYPES = [
  { value: 'digital', label: 'Digital Printing' },
  { value: 'offset', label: 'Offset Printing' },
  { value: 'wide_format', label: 'Wide Format' },
  { value: 'screen_printing', label: 'Screen Printing' },
  { value: '3d_printing', label: '3D Printing' },
  { value: 'letterpress', label: 'Letterpress' },
  { value: 'inkjet', label: 'Inkjet' },
  { value: 'laser', label: 'Laser Printing' },
  { value: 'other', label: 'Other' },
]

const CAPABILITIES = [
  { value: 'color', label: 'Color Printing' },
  { value: 'black_white', label: 'Black & White' },
  { value: 'large_format', label: 'Large Format' },
  { value: 'binding', label: 'Binding' },
  { value: 'lamination', label: 'Lamination' },
  { value: 'cutting', label: 'Cutting' },
  { value: 'folding', label: 'Folding' },
  { value: 'stapling', label: 'Stapling' },
  { value: 'drilling', label: 'Drilling' },
  { value: 'embossing', label: 'Embossing' },
  { value: 'foil_stamping', label: 'Foil Stamping' },
  { value: 'die_cutting', label: 'Die Cutting' },
  { value: 'other', label: 'Other' },
]

const CORE_SERVICES = [
  { value: 'document_printing', label: 'Document Printing' },
  { value: 'poster_printing', label: 'Poster Printing' },
  { value: 'banner_printing', label: 'Banner Printing' },
  { value: 'business_cards', label: 'Business Cards' },
  { value: 'flyers', label: 'Flyers' },
  { value: 'brochures', label: 'Brochures' },
  { value: 'booklets', label: 'Booklets' },
  { value: 'binding', label: 'Binding Services' },
  { value: 'lamination', label: 'Lamination Services' },
  { value: 'custom_printing', label: 'Custom Printing' },
]

const DELIVERY_OPTIONS = [
  { value: 'pickup', label: 'Customer Pickup' },
  { value: 'local_delivery', label: 'Local Delivery' },
  { value: 'shipping', label: 'Shipping' },
  { value: 'mail', label: 'Mail Service' },
]

const PAPER_FINISHES = [
  { value: 'matte', label: 'Matte' },
  { value: 'gloss', label: 'Gloss' },
  { value: 'satin', label: 'Satin' },
  { value: 'uncoated', label: 'Uncoated' },
  { value: 'other', label: 'Other' },
]

export function EquipmentServicesStep({ 
  user, 
  data, 
  onComplete, 
  onNext, 
  isLoading = false 
}: EquipmentServicesStepProps) {
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  const form = useForm<OnboardingStep3>({
    resolver: zodResolver(onboardingStep3Schema),
    defaultValues: {
      equipment: {
        printerTypes: data?.equipment?.printerTypes || ['digital'],
        capabilities: data?.equipment?.capabilities || ['color', 'black_white'],
        maxPrintSize: data?.equipment?.maxPrintSize || {
          width: 11,
          height: 17,
          unit: 'inches',
        },
        paperTypes: data?.equipment?.paperTypes || [
          { name: 'Standard Copy Paper', weight: '20lb', finish: 'uncoated' }
        ],
        specialEquipment: data?.equipment?.specialEquipment || [],
        certifications: data?.equipment?.certifications || [],
      },
      services: {
        coreServices: data?.services?.coreServices || ['document_printing', 'business_cards'],
        turnaroundTimes: data?.services?.turnaroundTimes || {
          rush: { time: 'Same day', surcharge: 50 },
          standard: { time: '1-2 business days', surcharge: 0 },
          extended: { time: '5+ business days', discount: 10 },
        },
        deliveryOptions: data?.services?.deliveryOptions || ['pickup'],
        specializations: data?.services?.specializations || [],
        customServices: data?.services?.customServices || [],
      },
    },
  })

  const { fields: paperTypeFields, append: appendPaperType, remove: removePaperType } = useFieldArray({
    control: form.control,
    name: 'equipment.paperTypes',
  })

  // Custom services functionality can be added later if needed

  const onSubmit = async (formData: OnboardingStep3) => {
    try {
      setSaveError(null)
      setSaveSuccess(false)
      
      onComplete(formData)
      setSaveSuccess(true)
      
      setTimeout(() => {
        onNext()
      }, 1000)
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save equipment and services')
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
          <AlertDescription>Equipment and services saved successfully!</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          
          {/* Equipment & Capabilities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Equipment & Capabilities
              </CardTitle>
              <CardDescription>
                Tell customers about your printing equipment and capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Printer Types */}
              <FormField
                control={form.control}
                name="equipment.printerTypes"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Printer Types *</FormLabel>
                      <FormDescription>
                        Select all types of printers you have available
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {PRINTER_TYPES.map((type) => (
                        <FormField
                          key={type.value}
                          control={form.control}
                          name="equipment.printerTypes"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={type.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(type.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, type.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== type.value
                                            )
                                          )
                                    }}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {type.label}
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

              {/* Capabilities */}
              <FormField
                control={form.control}
                name="equipment.capabilities"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Capabilities *</FormLabel>
                      <FormDescription>
                        Select all printing and finishing capabilities you offer
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {CAPABILITIES.map((capability) => (
                        <FormField
                          key={capability.value}
                          control={form.control}
                          name="equipment.capabilities"
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
                                              (value) => value !== capability.value
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

              {/* Max Print Size */}
              <div className="space-y-3">
                <FormLabel className="text-base">Maximum Print Size *</FormLabel>
                <div className="grid grid-cols-3 gap-3">
                  <FormField
                    control={form.control}
                    name="equipment.maxPrintSize.width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Width</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            step="0.1"
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
                    name="equipment.maxPrintSize.height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Height</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="1"
                            step="0.1"
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
                    name="equipment.maxPrintSize.unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm">Unit</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="inches">Inches</SelectItem>
                            <SelectItem value="cm">Centimeters</SelectItem>
                            <SelectItem value="mm">Millimeters</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Paper Types */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel className="text-base">Paper Types Available *</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendPaperType({ name: '', weight: '', finish: 'uncoated' })}
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Paper Type
                  </Button>
                </div>

                {paperTypeFields.map((field, index) => (
                  <Card key={field.id} className="border-2 border-dashed border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium text-sm">Paper Type {index + 1}</h4>
                        {paperTypeFields.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removePaperType(index)}
                            disabled={isLoading}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <FormField
                          control={form.control}
                          name={`equipment.paperTypes.${index}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Paper Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="Standard Copy Paper"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`equipment.paperTypes.${index}.weight`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Weight</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="20lb, 80gsm"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name={`equipment.paperTypes.${index}.finish`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Finish</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {PAPER_FINISHES.map(finish => (
                                    <SelectItem key={finish.value} value={finish.value}>
                                      {finish.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Services Offered
              </CardTitle>
              <CardDescription>
                Define the services you provide to customers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              {/* Core Services */}
              <FormField
                control={form.control}
                name="services.coreServices"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Core Services *</FormLabel>
                      <FormDescription>
                        Select the main printing services you offer
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {CORE_SERVICES.map((service) => (
                        <FormField
                          key={service.value}
                          control={form.control}
                          name="services.coreServices"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={service.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, service.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== service.value
                                            )
                                          )
                                    }}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {service.label}
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

              {/* Turnaround Times */}
              <div className="space-y-4">
                <FormLabel className="text-base">Turnaround Times *</FormLabel>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-2 border-dashed border-red-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm mb-3 text-red-700">Rush Service</h4>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="services.turnaroundTimes.rush.time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Timeframe *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="Same day, 2 hours"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="services.turnaroundTimes.rush.surcharge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Surcharge (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="200"
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

                  <Card className="border-2 border-dashed border-blue-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm mb-3 text-blue-700">Standard Service</h4>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="services.turnaroundTimes.standard.time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Timeframe *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="1-2 business days"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="services.turnaroundTimes.standard.surcharge"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Surcharge (%)</FormLabel>
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

                  <Card className="border-2 border-dashed border-green-200">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-sm mb-3 text-green-700">Extended Service</h4>
                      <div className="space-y-3">
                        <FormField
                          control={form.control}
                          name="services.turnaroundTimes.extended.time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Timeframe *</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field}
                                  placeholder="5+ business days"
                                  disabled={isLoading}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="services.turnaroundTimes.extended.discount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-xs">Discount (%)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  min="0"
                                  max="50"
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
                </div>
              </div>

              {/* Delivery Options */}
              <FormField
                control={form.control}
                name="services.deliveryOptions"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Delivery Options *</FormLabel>
                      <FormDescription>
                        How customers can receive their completed orders
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {DELIVERY_OPTIONS.map((option) => (
                        <FormField
                          key={option.value}
                          control={form.control}
                          name="services.deliveryOptions"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={option.value}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(option.value)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, option.value])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== option.value
                                            )
                                          )
                                    }}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {option.label}
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
            </CardContent>
          </Card>

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