'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { printShopVerificationSchema, type PrintShopVerification, type VerificationDocument } from '@/lib/validations/verification'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Building2, 
  Phone, 
  MapPin, 
  Printer,
  Clock,
  FileText,
  Award,
  Info,
  Plus,
  X,
  AlertCircle,
  CheckCircle,
  Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DocumentUpload } from './document-upload'

interface PrintShopVerificationFormProps {
  onSubmit: (data: PrintShopVerification) => Promise<void>
  isLoading?: boolean
  existingData?: Partial<PrintShopVerification>
}

export function PrintShopVerificationForm({ 
  onSubmit, 
  isLoading = false,
  existingData
}: PrintShopVerificationFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [uploadedDocuments, setUploadedDocuments] = useState<(VerificationDocument & { fileKey: string; fileUrl: string })[]>(
    existingData?.documents || []
  )

  const form = useForm<PrintShopVerification>({
    resolver: zodResolver(printShopVerificationSchema),
    defaultValues: {
      businessInfo: {
        legalName: existingData?.businessInfo?.legalName || '',
        dbaName: existingData?.businessInfo?.dbaName || '',
        businessType: existingData?.businessInfo?.businessType || undefined,
        taxId: existingData?.businessInfo?.taxId || '',
        yearEstablished: existingData?.businessInfo?.yearEstablished || new Date().getFullYear(),
        description: existingData?.businessInfo?.description || '',
      },
      contactInfo: {
        businessPhone: existingData?.contactInfo?.businessPhone || '',
        businessEmail: existingData?.contactInfo?.businessEmail || '',
        website: existingData?.contactInfo?.website || '',
      },
      address: {
        streetAddress: existingData?.address?.streetAddress || '',
        city: existingData?.address?.city || '',
        state: existingData?.address?.state || '',
        zipCode: existingData?.address?.zipCode || '',
        country: existingData?.address?.country || 'United States',
      },
      equipment: {
        printerTypes: existingData?.equipment?.printerTypes || [],
        capabilities: existingData?.equipment?.capabilities || [],
        maxPrintSize: existingData?.equipment?.maxPrintSize || '',
        paperTypes: existingData?.equipment?.paperTypes || [],
      },
      services: {
        turnaroundTimes: {
          rush: existingData?.services?.turnaroundTimes?.rush || '',
          standard: existingData?.services?.turnaroundTimes?.standard || '',
          extended: existingData?.services?.turnaroundTimes?.extended || '',
        },
        deliveryOptions: existingData?.services?.deliveryOptions || [],
        specialties: existingData?.services?.specialties || [],
      },
      documents: uploadedDocuments,
      certifications: existingData?.certifications || [],
      additionalInfo: {
        yearsExperience: existingData?.additionalInfo?.yearsExperience || 0,
        employeeCount: existingData?.additionalInfo?.employeeCount || 1,
        preferredCustomerTypes: existingData?.additionalInfo?.preferredCustomerTypes || [],
        notes: existingData?.additionalInfo?.notes || '',
      },
    }
  })

  const { fields: paperTypeFields, append: appendPaperType, remove: removePaperType } = useFieldArray({
    control: form.control,
    name: "equipment.paperTypes"
  })

  const { fields: specialtyFields, append: appendSpecialty, remove: removeSpecialty } = useFieldArray({
    control: form.control,
    name: "services.specialties"
  })

  const { fields: certificationFields, append: appendCertification, remove: removeCertification } = useFieldArray({
    control: form.control,
    name: "certifications"
  })

  const handleFormSubmit = async (data: PrintShopVerification) => {
    try {
      setSubmitError(null)
      setSubmitSuccess(false)
      
      // Include uploaded documents
      const submissionData = {
        ...data,
        documents: uploadedDocuments
      }
      
      await onSubmit(submissionData)
      setSubmitSuccess(true)
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to submit verification')
    }
  }

  const handleDocumentUploaded = (document: VerificationDocument & { fileKey: string; fileUrl: string }) => {
    const existingIndex = uploadedDocuments.findIndex(doc => doc.type === document.type)
    if (existingIndex >= 0) {
      // Replace existing document of same type
      const newDocuments = [...uploadedDocuments]
      newDocuments[existingIndex] = document
      setUploadedDocuments(newDocuments)
    } else {
      // Add new document
      setUploadedDocuments([...uploadedDocuments, document])
    }
    form.setValue('documents', [...uploadedDocuments, document])
  }

  const handleDocumentRemoved = (documentType: string) => {
    const newDocuments = uploadedDocuments.filter(doc => doc.type !== documentType)
    setUploadedDocuments(newDocuments)
    form.setValue('documents', newDocuments)
  }

  const printerTypeOptions = [
    { value: 'digital', label: 'Digital Printing' },
    { value: 'offset', label: 'Offset Printing' },
    { value: 'wide_format', label: 'Wide Format' },
    { value: 'screen_printing', label: 'Screen Printing' },
    { value: '3d_printing', label: '3D Printing' },
    { value: 'letterpress', label: 'Letterpress' },
    { value: 'other', label: 'Other' },
  ]

  const capabilityOptions = [
    { value: 'color', label: 'Color Printing' },
    { value: 'black_white', label: 'Black & White' },
    { value: 'large_format', label: 'Large Format' },
    { value: 'binding', label: 'Binding' },
    { value: 'lamination', label: 'Lamination' },
    { value: 'cutting', label: 'Cutting' },
    { value: 'folding', label: 'Folding' },
    { value: 'stapling', label: 'Stapling' },
    { value: 'other', label: 'Other' },
  ]

  const deliveryOptions = [
    { value: 'pickup', label: 'Customer Pickup' },
    { value: 'local_delivery', label: 'Local Delivery' },
    { value: 'shipping', label: 'Shipping' },
    { value: 'mail', label: 'Mail' },
  ]

  const customerTypeOptions = [
    { value: 'students', label: 'Students' },
    { value: 'small_business', label: 'Small Business' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'non_profit', label: 'Non-Profit' },
    { value: 'government', label: 'Government' },
    { value: 'other', label: 'Other' },
  ]

  return (
    <div className="space-y-6">
      {submitError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{submitError}</AlertDescription>
        </Alert>
      )}

      {submitSuccess && (
        <Alert className="border-green-200 bg-green-50 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>Verification request submitted successfully!</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
          {/* Business Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Business Information
              </CardTitle>
              <CardDescription>
                Legal business details and company information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessInfo.legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Business Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessInfo.dbaName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>DBA Name (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Doing Business As" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="businessInfo.businessType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select business type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sole_proprietorship">Sole Proprietorship</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="llc">LLC</SelectItem>
                          <SelectItem value="corporation">Corporation</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="businessInfo.yearEstablished"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year Established</FormLabel>
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
                name="businessInfo.taxId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax ID (EIN/SSN)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="XX-XXXXXXX" disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="businessInfo.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Describe your printing business, services, and what makes you unique..."
                        rows={4}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Documentation Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Required Documentation
              </CardTitle>
              <CardDescription>
                Upload required business documents for verification. All documents must be current and clearly readable.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <DocumentUpload
                documentType="business_license"
                onDocumentUploaded={handleDocumentUploaded}
                onDocumentRemoved={() => handleDocumentRemoved('business_license')}
                existingDocument={uploadedDocuments.find(doc => doc.type === 'business_license')}
                isLoading={isLoading}
              />
              
              <DocumentUpload
                documentType="tax_id"
                onDocumentUploaded={handleDocumentUploaded}
                onDocumentRemoved={() => handleDocumentRemoved('tax_id')}
                existingDocument={uploadedDocuments.find(doc => doc.type === 'tax_id')}
                isLoading={isLoading}
              />
              
              <DocumentUpload
                documentType="insurance"
                onDocumentUploaded={handleDocumentUploaded}
                onDocumentRemoved={() => handleDocumentRemoved('insurance')}
                existingDocument={uploadedDocuments.find(doc => doc.type === 'insurance')}
                isLoading={isLoading}
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
              Reset Form
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading || uploadedDocuments.length < 2}
              className={cn(
                "min-w-[160px]",
                submitSuccess && "bg-green-600 hover:bg-green-700"
              )}
            >
              {isLoading ? 'Submitting...' : submitSuccess ? 'Submitted!' : 'Submit for Verification'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}