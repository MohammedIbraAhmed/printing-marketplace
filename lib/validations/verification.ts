import { z } from 'zod'

export const verificationDocumentSchema = z.object({
  type: z.enum(['business_license', 'tax_id', 'insurance', 'certifications', 'other']),
  fileName: z.string().min(1, 'File name is required'),
  fileType: z.string().regex(/^(image|application)\/(jpeg|jpg|png|pdf)$/, 'Only JPEG, PNG, and PDF files are allowed'),
  fileSize: z.number().max(10 * 1024 * 1024, 'File must be less than 10MB'),
  description: z.string().optional()
})

export const printShopVerificationSchema = z.object({
  businessInfo: z.object({
    legalName: z.string().min(2, 'Legal business name is required'),
    dbaName: z.string().optional(),
    businessType: z.enum(['sole_proprietorship', 'partnership', 'llc', 'corporation', 'other']),
    taxId: z.string().min(9, 'Tax ID must be at least 9 characters'),
    yearEstablished: z.number().min(1900).max(new Date().getFullYear()),
    description: z.string().min(50, 'Business description must be at least 50 characters'),
  }),
  
  contactInfo: z.object({
    businessPhone: z.string().min(10, 'Business phone number is required'),
    businessEmail: z.string().email('Valid business email is required'),
    website: z.string().url('Valid website URL is required').optional().or(z.literal('')),
  }),

  address: z.object({
    streetAddress: z.string().min(5, 'Street address is required'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code is required'),
    country: z.string().min(2, 'Country is required'),
  }),

  equipment: z.object({
    printerTypes: z.array(z.enum(['digital', 'offset', 'wide_format', 'screen_printing', '3d_printing', 'letterpress', 'other'])).min(1, 'At least one printer type is required'),
    capabilities: z.array(z.enum(['color', 'black_white', 'large_format', 'binding', 'lamination', 'cutting', 'folding', 'stapling', 'other'])).min(1, 'At least one capability is required'),
    maxPrintSize: z.string().min(1, 'Maximum print size is required'),
    paperTypes: z.array(z.string()).min(1, 'At least one paper type is required'),
  }),

  services: z.object({
    turnaroundTimes: z.object({
      rush: z.string().min(1, 'Rush turnaround time is required'),
      standard: z.string().min(1, 'Standard turnaround time is required'),
      extended: z.string().min(1, 'Extended turnaround time is required'),
    }),
    deliveryOptions: z.array(z.enum(['pickup', 'local_delivery', 'shipping', 'mail'])).min(1, 'At least one delivery option is required'),
    specialties: z.array(z.string()).optional(),
  }),

  documents: z.array(verificationDocumentSchema).min(2, 'At least 2 verification documents are required'),
  
  certifications: z.array(z.object({
    name: z.string().min(1, 'Certification name is required'),
    issuingBody: z.string().min(1, 'Issuing body is required'),
    expirationDate: z.string().optional(),
    certificateNumber: z.string().optional(),
  })).optional(),

  additionalInfo: z.object({
    yearsExperience: z.number().min(0).max(100),
    employeeCount: z.number().min(1).max(10000),
    preferredCustomerTypes: z.array(z.enum(['students', 'small_business', 'enterprise', 'non_profit', 'government', 'other'])).optional(),
    notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  }).optional(),
})

export type VerificationDocument = z.infer<typeof verificationDocumentSchema>
export type PrintShopVerification = z.infer<typeof printShopVerificationSchema>

// Verification status enum
export const VerificationStatus = {
  PENDING: 'pending',
  UNDER_REVIEW: 'under_review', 
  APPROVED: 'approved',
  REJECTED: 'rejected',
  EXPIRED: 'expired',
} as const

export type VerificationStatusType = typeof VerificationStatus[keyof typeof VerificationStatus]