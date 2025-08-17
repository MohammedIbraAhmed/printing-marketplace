import { z } from 'zod'

// Extended print shop profile schema for directory and onboarding
export const printShopProfileSchema = z.object({
  // Basic Business Information
  businessInfo: z.object({
    displayName: z.string().min(2, 'Business display name is required'),
    legalName: z.string().min(2, 'Legal business name is required'),
    dbaName: z.string().optional(),
    businessType: z.enum(['sole_proprietorship', 'partnership', 'llc', 'corporation', 'other']),
    taxId: z.string().min(9, 'Tax ID must be at least 9 characters'),
    yearEstablished: z.number().min(1900).max(new Date().getFullYear()),
    description: z.string().min(50, 'Business description must be at least 50 characters'),
    website: z.string().url('Valid website URL is required').optional().or(z.literal('')),
    logo: z.string().url('Logo must be a valid URL').optional(),
  }),

  // Contact Information
  contactInfo: z.object({
    businessPhone: z.string().min(10, 'Business phone number is required'),
    businessEmail: z.string().email('Valid business email is required'),
    supportEmail: z.string().email('Valid support email is required').optional(),
    emergencyContact: z.object({
      name: z.string().min(2, 'Emergency contact name is required'),
      phone: z.string().min(10, 'Emergency contact phone is required'),
      relationship: z.string().min(2, 'Relationship is required'),
    }).optional(),
  }),

  // Physical Location
  location: z.object({
    address: z.object({
      streetAddress: z.string().min(5, 'Street address is required'),
      addressLine2: z.string().optional(),
      city: z.string().min(2, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().min(5, 'ZIP code is required'),
      country: z.string().min(2, 'Country is required'),
    }),
    coordinates: z.object({
      latitude: z.number().min(-90).max(90),
      longitude: z.number().min(-180).max(180),
    }).optional(),
    serviceRadius: z.number().min(0).max(500).default(25), // Miles
    pickupAvailable: z.boolean().default(true),
    deliveryAvailable: z.boolean().default(false),
    shippingAvailable: z.boolean().default(true),
  }),

  // Business Hours
  businessHours: z.object({
    timezone: z.string().default('America/New_York'),
    schedule: z.object({
      monday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(), // Format: "09:00"
        closeTime: z.string().optional(), // Format: "17:00"
        breakStart: z.string().optional(),
        breakEnd: z.string().optional(),
      }),
      tuesday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
        breakStart: z.string().optional(),
        breakEnd: z.string().optional(),
      }),
      wednesday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
        breakStart: z.string().optional(),
        breakEnd: z.string().optional(),
      }),
      thursday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
        breakStart: z.string().optional(),
        breakEnd: z.string().optional(),
      }),
      friday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
        breakStart: z.string().optional(),
        breakEnd: z.string().optional(),
      }),
      saturday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
        breakStart: z.string().optional(),
        breakEnd: z.string().optional(),
      }),
      sunday: z.object({
        isOpen: z.boolean(),
        openTime: z.string().optional(),
        closeTime: z.string().optional(),
        breakStart: z.string().optional(),
        breakEnd: z.string().optional(),
      }),
    }),
    specialHours: z.array(z.object({
      date: z.string(), // ISO date string
      isOpen: z.boolean(),
      openTime: z.string().optional(),
      closeTime: z.string().optional(),
      note: z.string().optional(),
    })).optional(),
    holidayClosures: z.array(z.object({
      name: z.string(),
      startDate: z.string(),
      endDate: z.string(),
    })).optional(),
  }),

  // Equipment and Capabilities
  equipment: z.object({
    printerTypes: z.array(z.enum([
      'digital', 'offset', 'wide_format', 'screen_printing', 
      '3d_printing', 'letterpress', 'inkjet', 'laser', 'other'
    ])).min(1, 'At least one printer type is required'),
    
    capabilities: z.array(z.enum([
      'color', 'black_white', 'large_format', 'binding', 'lamination', 
      'cutting', 'folding', 'stapling', 'drilling', 'embossing', 
      'foil_stamping', 'die_cutting', 'other'
    ])).min(1, 'At least one capability is required'),
    
    maxPrintSize: z.object({
      width: z.number().min(1),
      height: z.number().min(1),
      unit: z.enum(['inches', 'mm', 'cm']).default('inches'),
    }),
    
    paperTypes: z.array(z.object({
      name: z.string(),
      weight: z.string().optional(),
      finish: z.enum(['matte', 'gloss', 'satin', 'uncoated', 'other']).optional(),
      color: z.string().optional(),
    })).min(1, 'At least one paper type is required'),
    
    specialEquipment: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
  }),

  // Services and Pricing
  services: z.object({
    // Core Services
    coreServices: z.array(z.enum([
      'document_printing', 'poster_printing', 'banner_printing', 
      'business_cards', 'flyers', 'brochures', 'booklets', 
      'binding', 'lamination', 'custom_printing'
    ])).min(1, 'At least one core service is required'),
    
    // Turnaround Times
    turnaroundTimes: z.object({
      rush: z.object({
        time: z.string().min(1, 'Rush turnaround time is required'),
        surcharge: z.number().min(0).default(0), // Percentage
      }),
      standard: z.object({
        time: z.string().min(1, 'Standard turnaround time is required'),
        surcharge: z.number().min(0).default(0),
      }),
      extended: z.object({
        time: z.string().min(1, 'Extended turnaround time is required'),
        discount: z.number().min(0).default(0), // Percentage
      }),
    }),
    
    // Delivery Options
    deliveryOptions: z.array(z.enum(['pickup', 'local_delivery', 'shipping', 'mail'])).min(1),
    
    // Specializations
    specializations: z.array(z.string()).optional(),
    
    // Custom Services
    customServices: z.array(z.object({
      name: z.string(),
      description: z.string(),
      basePrice: z.number().min(0).optional(),
      unit: z.string().optional(),
    })).optional(),
  }),

  // Pricing Information
  pricing: z.object({
    // Base Pricing Model
    pricingModel: z.enum(['per_page', 'per_job', 'per_hour', 'custom']).default('per_page'),
    
    // Base Rates
    baseRates: z.object({
      blackWhite: z.object({
        singleSided: z.number().min(0),
        doubleSided: z.number().min(0),
      }),
      color: z.object({
        singleSided: z.number().min(0),
        doubleSided: z.number().min(0),
      }),
    }),
    
    // Volume Discounts
    volumeDiscounts: z.array(z.object({
      minimumQuantity: z.number().min(1),
      discountPercentage: z.number().min(0).max(100),
    })).optional(),
    
    // Additional Service Fees
    additionalFees: z.object({
      binding: z.number().min(0).default(0),
      lamination: z.number().min(0).default(0),
      cutting: z.number().min(0).default(0),
      rush: z.number().min(0).default(0), // Rush fee
      delivery: z.number().min(0).default(0),
    }),
    
    // Minimum Order
    minimumOrder: z.object({
      amount: z.number().min(0).default(0),
      pages: z.number().min(0).default(1),
    }),
    
    // Free Quotes
    providesQuotes: z.boolean().default(true),
    quoteTurnaround: z.string().default('24 hours'),
  }),

  // Capacity and Availability
  capacity: z.object({
    maxDailyJobs: z.number().min(1).default(50),
    maxWeeklyJobs: z.number().min(1).default(300),
    currentWorkload: z.number().min(0).default(0), // Percentage
    acceptingOrders: z.boolean().default(true),
    emergencyCapacity: z.boolean().default(false),
    peakHours: z.array(z.object({
      day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
      startTime: z.string(),
      endTime: z.string(),
    })).optional(),
  }),

  // Photos and Media
  media: z.object({
    shopPhotos: z.array(z.object({
      url: z.string().url(),
      caption: z.string().optional(),
      isMain: z.boolean().default(false),
      category: z.enum(['interior', 'exterior', 'equipment', 'samples', 'staff']).optional(),
    })).optional(),
    sampleWork: z.array(z.object({
      url: z.string().url(),
      title: z.string(),
      description: z.string().optional(),
      serviceType: z.string(),
    })).optional(),
    videos: z.array(z.object({
      url: z.string().url(),
      title: z.string(),
      description: z.string().optional(),
    })).optional(),
  }),

  // Customer Interaction Settings
  customerSettings: z.object({
    acceptsWalkIns: z.boolean().default(true),
    requiresAppointment: z.boolean().default(false),
    onlineOrderingEnabled: z.boolean().default(true),
    autoAcceptOrders: z.boolean().default(false),
    communicationPreferences: z.array(z.enum(['email', 'phone', 'sms', 'app'])).default(['email']),
    responseTimeGuarantee: z.string().optional(), // e.g., "2 hours"
  }),

  // Quality and Certifications
  quality: z.object({
    qualityGuarantee: z.string().optional(),
    returnPolicy: z.string().optional(),
    certifications: z.array(z.object({
      name: z.string(),
      issuingBody: z.string(),
      expirationDate: z.string().optional(),
      certificateUrl: z.string().url().optional(),
    })).optional(),
    insuranceAmount: z.number().min(0).optional(),
    bondedAmount: z.number().min(0).optional(),
  }),

  // Platform Settings
  platformSettings: z.object({
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    allowsReviews: z.boolean().default(true),
    publicProfile: z.boolean().default(true),
    searchable: z.boolean().default(true),
    promotionalOffers: z.boolean().default(false),
  }),
})

// Onboarding step schemas
export const onboardingStep1Schema = printShopProfileSchema.pick({
  businessInfo: true,
  contactInfo: true,
})

export const onboardingStep2Schema = printShopProfileSchema.pick({
  location: true,
  businessHours: true,
})

export const onboardingStep3Schema = printShopProfileSchema.pick({
  equipment: true,
  services: true,
})

export const onboardingStep4Schema = printShopProfileSchema.pick({
  pricing: true,
  capacity: true,
})

export const onboardingStep5Schema = printShopProfileSchema.pick({
  media: true,
  customerSettings: true,
  quality: true,
})

// Types
export type PrintShopProfile = z.infer<typeof printShopProfileSchema>
export type OnboardingStep1 = z.infer<typeof onboardingStep1Schema>
export type OnboardingStep2 = z.infer<typeof onboardingStep2Schema>
export type OnboardingStep3 = z.infer<typeof onboardingStep3Schema>
export type OnboardingStep4 = z.infer<typeof onboardingStep4Schema>
export type OnboardingStep5 = z.infer<typeof onboardingStep5Schema>

// Validation helpers
export const validateOnboardingStep = (step: number, data: unknown) => {
  switch (step) {
    case 1:
      return onboardingStep1Schema.safeParse(data)
    case 2:
      return onboardingStep2Schema.safeParse(data)
    case 3:
      return onboardingStep3Schema.safeParse(data)
    case 4:
      return onboardingStep4Schema.safeParse(data)
    case 5:
      return onboardingStep5Schema.safeParse(data)
    default:
      throw new Error('Invalid onboarding step')
  }
}

// Location search filters
export const shopSearchFiltersSchema = z.object({
  query: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    radius: z.number().min(1).max(100).default(25), // Miles
  }).optional(),
  services: z.array(z.string()).optional(),
  printerTypes: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  priceRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  rating: z.number().min(1).max(5).optional(),
  isOpen: z.boolean().optional(),
  acceptingOrders: z.boolean().optional(),
  sortBy: z.enum(['distance', 'rating', 'price', 'name', 'newest']).default('distance'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
})

export type ShopSearchFilters = z.infer<typeof shopSearchFiltersSchema>