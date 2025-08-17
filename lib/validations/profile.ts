import { z } from "zod"

// Common profile fields for all users
export const baseProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  email: z.string().email("Please enter a valid email address"),
})

// Customer-specific profile validation
export const customerProfileSchema = baseProfileSchema.extend({
  profile: z.object({
    location: z.object({
      address: z.string().min(5, "Please enter a valid address").max(200, "Address must be less than 200 characters"),
      city: z.string().min(2, "Please enter a valid city").max(100, "City must be less than 100 characters"),
      state: z.string().min(2, "Please enter a valid state").max(50, "State must be less than 50 characters"),
      zipCode: z.string().min(3, "Please enter a valid zip code").max(10, "Zip code must be less than 10 characters"),
      country: z.string().min(2, "Please enter a valid country").max(50, "Country must be less than 50 characters"),
      coordinates: z.array(z.number()).length(2).optional() // [lng, lat]
    }).optional(),
    phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number").optional(),
    preferences: z.object({
      preferredPrintShops: z.array(z.string()).optional(),
      defaultOrderNotes: z.string().max(500, "Notes must be less than 500 characters").optional(),
    }).optional()
  }).optional()
})

// Creator-specific profile validation
export const creatorProfileSchema = baseProfileSchema.extend({
  profile: z.object({
    bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
    specializations: z.array(z.string()).max(10, "Maximum 10 specializations").optional(),
    portfolio: z.array(z.string().url("Invalid portfolio URL")).max(5, "Maximum 5 portfolio items").optional(),
    education: z.object({
      degree: z.string().max(100, "Degree must be less than 100 characters").optional(),
      institution: z.string().max(100, "Institution must be less than 100 characters").optional(),
      graduationYear: z.number().min(1900).max(new Date().getFullYear() + 10).optional()
    }).optional(),
    experience: z.object({
      yearsTeaching: z.number().min(0).max(50).optional(),
      subjects: z.array(z.string()).max(20, "Maximum 20 subjects").optional(),
      certifications: z.array(z.string()).max(10, "Maximum 10 certifications").optional()
    }).optional(),
    socialMedia: z.object({
      website: z.string().url("Invalid website URL").optional(),
      linkedin: z.string().url("Invalid LinkedIn URL").optional(),
      twitter: z.string().url("Invalid Twitter URL").optional(),
      github: z.string().url("Invalid GitHub URL").optional()
    }).optional()
  }).optional()
})

// Print Shop-specific profile validation
export const printShopProfileSchema = baseProfileSchema.extend({
  profile: z.object({
    businessInfo: z.object({
      businessName: z.string().min(2, "Business name is required").max(100, "Business name must be less than 100 characters"),
      description: z.string().max(1000, "Description must be less than 1000 characters"),
      businessType: z.enum(['independent', 'franchise', 'corporation'], {
        errorMap: () => ({ message: "Please select a valid business type" })
      }),
      taxId: z.string().min(5, "Tax ID is required").max(20, "Tax ID must be less than 20 characters"),
      license: z.string().min(5, "Business license number is required").max(50, "License must be less than 50 characters"),
      capabilities: z.array(z.enum([
        'black-white-printing',
        'color-printing',
        'large-format',
        'binding',
        'laminating',
        'scanning',
        'copying',
        'design-services',
        'rush-orders',
        'pickup-delivery'
      ])).min(1, "At least one capability is required"),
      equipment: z.array(z.string()).min(1, "At least one equipment item is required"),
      maxOrderSize: z.number().min(1, "Maximum order size must be at least 1").max(10000, "Maximum order size cannot exceed 10,000"),
      averageTurnaround: z.number().min(1, "Average turnaround must be at least 1 hour").max(168, "Average turnaround cannot exceed 1 week"), // hours
    }),
    location: z.object({
      address: z.string().min(5, "Business address is required").max(200, "Address must be less than 200 characters"),
      city: z.string().min(2, "City is required").max(100, "City must be less than 100 characters"),
      state: z.string().min(2, "State is required").max(50, "State must be less than 50 characters"),
      zipCode: z.string().min(3, "Zip code is required").max(10, "Zip code must be less than 10 characters"),
      country: z.string().min(2, "Country is required").max(50, "Country must be less than 50 characters"),
      coordinates: z.array(z.number()).length(2).optional() // [lng, lat]
    }),
    contact: z.object({
      phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/, "Please enter a valid phone number"),
      email: z.string().email("Please enter a valid business email").optional(),
      website: z.string().url("Please enter a valid website URL").optional()
    }),
    hours: z.record(z.string(), z.object({
      open: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
      close: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
      closed: z.boolean().optional()
    })).optional(),
    pricing: z.record(z.string(), z.number().positive("Pricing must be positive")).optional(),
    verification: z.object({
      documents: z.array(z.object({
        type: z.enum(['business-license', 'tax-document', 'insurance', 'equipment-photo', 'other']),
        url: z.string().url("Invalid document URL"),
        uploadedAt: z.date(),
        status: z.enum(['pending', 'approved', 'rejected']).optional()
      })).optional(),
      status: z.enum(['unverified', 'pending', 'verified', 'rejected']).default('unverified'),
      verifiedAt: z.date().optional(),
      rejectionReason: z.string().optional()
    }).optional()
  }).optional()
})

// Admin profile validation (minimal additional fields)
export const adminProfileSchema = baseProfileSchema.extend({
  profile: z.object({
    department: z.string().max(100, "Department must be less than 100 characters").optional(),
    permissions: z.array(z.enum([
      'user-management',
      'content-moderation',
      'financial-reports',
      'system-settings',
      'verification-approval'
    ])).optional(),
    lastLogin: z.date().optional()
  }).optional()
})

// Settings-specific validation schemas
export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(8, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const notificationPreferencesSchema = z.object({
  email: z.boolean(),
  orderUpdates: z.boolean(),
  marketing: z.boolean(),
  weeklyDigest: z.boolean().optional(),
  pushNotifications: z.boolean().optional(),
  smsNotifications: z.boolean().optional()
})

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'business-only', 'private']),
  showEmail: z.boolean(),
  showPhone: z.boolean(),
  allowDataSharing: z.boolean(),
  allowMarketingEmails: z.boolean(),
  allowAnalytics: z.boolean()
})

// Profile image upload validation
export const profileImageSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  fileType: z.enum(['image/jpeg', 'image/png', 'image/webp'], {
    errorMap: () => ({ message: "Only JPEG, PNG, and WebP images are allowed" })
  }),
  fileSize: z.number().max(5 * 1024 * 1024, "Image must be less than 5MB")
})

// Utility function to get the appropriate schema based on user role
export function getProfileSchemaByRole(role: string) {
  switch (role) {
    case 'customer':
      return customerProfileSchema
    case 'creator':
      return creatorProfileSchema
    case 'printShop':
      return printShopProfileSchema
    case 'admin':
      return adminProfileSchema
    default:
      return baseProfileSchema
  }
}

// Export type definitions for TypeScript
export type CustomerProfile = z.infer<typeof customerProfileSchema>
export type CreatorProfile = z.infer<typeof creatorProfileSchema>
export type PrintShopProfile = z.infer<typeof printShopProfileSchema>
export type AdminProfile = z.infer<typeof adminProfileSchema>
export type PasswordChangeData = z.infer<typeof passwordChangeSchema>
export type NotificationPreferences = z.infer<typeof notificationPreferencesSchema>
export type PrivacySettings = z.infer<typeof privacySettingsSchema>
export type ProfileImageData = z.infer<typeof profileImageSchema>