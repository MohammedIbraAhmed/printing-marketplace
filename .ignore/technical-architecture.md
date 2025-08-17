# Printing Marketplace Technical Architecture

## Executive Summary

This document provides a comprehensive technical architecture for the three-sided printing marketplace platform using Next.js, MongoDB Atlas, NextAuth.js, and Cloudflare R2. The architecture supports multi-role users (students, content creators, print shops), complex payment splitting via Stripe Connect, real-time order tracking, and global scalability.

## Technology Stack

### Core Framework
- **Next.js 14+** with App Router for full-stack development
- **TypeScript** for type safety across the application
- **shadcn/ui + Tailwind CSS** for component library and styling
- **React Hook Form + Zod** for form handling and validation

### Backend Services
- **Next.js API Routes** for serverless backend functionality
- **MongoDB Atlas** with Mongoose ODM for data persistence
- **NextAuth.js v5** for authentication and session management
- **Cloudflare R2** for file storage with global CDN distribution

### Infrastructure & Deployment
- **Vercel** for Next.js deployment with edge optimization
- **MongoDB Atlas** for managed database with auto-scaling
- **Cloudflare** for CDN, security, and file processing
- **GitHub Actions** for CI/CD pipeline

### Third-Party Integrations
- **Stripe Connect** for marketplace payment processing
- **SMTP2GO** for transactional email delivery
- **WebPush API** for real-time notifications

## Database Schema Design

### User Schema
```typescript
// models/User.ts
import { Schema, model, Document } from 'mongoose';

interface IUser extends Document {
  email: string;
  name: string;
  roles: ('customer' | 'creator' | 'printShop')[];
  profile: {
    avatar?: string;
    bio?: string;
    location?: {
      address: string;
      city: string;
      country: string;
      coordinates: [number, number]; // [longitude, latitude]
    };
    phone?: string;
    preferences: {
      notifications: {
        email: boolean;
        push: boolean;
        sms: boolean;
      };
      language: string;
      currency: string;
    };
  };
  // Role-specific data
  customerProfile?: {
    educationLevel: string;
    subjects: string[];
    orderHistory: Schema.Types.ObjectId[];
  };
  creatorProfile?: {
    expertise: string[];
    bio: string;
    socialLinks: {
      website?: string;
      linkedin?: string;
      twitter?: string;
    };
    verificationStatus: 'pending' | 'verified' | 'rejected';
    earnings: {
      total: number;
      thisMonth: number;
      pendingPayouts: number;
    };
  };
  printShopProfile?: {
    businessName: string;
    businessRegistration: string;
    capabilities: {
      colorPrinting: boolean;
      binding: string[];
      paperTypes: string[];
      maxSheetSize: string;
      specialties: string[];
    };
    operatingHours: {
      [key: string]: { open: string; close: string; isOpen: boolean };
    };
    pricing: {
      blackWhite: number; // per page
      color: number; // per page
      binding: { [type: string]: number };
    };
    capacity: {
      dailyOrders: number;
      currentLoad: number;
    };
    ratings: {
      overall: number;
      quality: number;
      speed: number;
      service: number;
      totalReviews: number;
    };
    stripeAccountId?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
  };
  // Authentication
  emailVerified: Date;
  accounts: Schema.Types.ObjectId[];
  sessions: Schema.Types.ObjectId[];
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
  isActive: boolean;
}

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  roles: [{ type: String, enum: ['customer', 'creator', 'printShop'], required: true }],
  profile: {
    avatar: String,
    bio: String,
    location: {
      address: String,
      city: String,
      country: String,
      coordinates: {
        type: [Number],
        index: '2dsphere'
      }
    },
    phone: String,
    preferences: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false }
      },
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'USD' }
    }
  },
  customerProfile: {
    educationLevel: String,
    subjects: [String],
    orderHistory: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
  },
  creatorProfile: {
    expertise: [String],
    bio: String,
    socialLinks: {
      website: String,
      linkedin: String,
      twitter: String
    },
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' },
    earnings: {
      total: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      pendingPayouts: { type: Number, default: 0 }
    }
  },
  printShopProfile: {
    businessName: String,
    businessRegistration: String,
    capabilities: {
      colorPrinting: { type: Boolean, default: false },
      binding: [String],
      paperTypes: [String],
      maxSheetSize: String,
      specialties: [String]
    },
    operatingHours: {
      type: Map,
      of: {
        open: String,
        close: String,
        isOpen: Boolean
      }
    },
    pricing: {
      blackWhite: Number,
      color: Number,
      binding: { type: Map, of: Number }
    },
    capacity: {
      dailyOrders: { type: Number, default: 50 },
      currentLoad: { type: Number, default: 0 }
    },
    ratings: {
      overall: { type: Number, default: 0 },
      quality: { type: Number, default: 0 },
      speed: { type: Number, default: 0 },
      service: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 }
    },
    stripeAccountId: String,
    verificationStatus: { type: String, enum: ['pending', 'verified', 'rejected'], default: 'pending' }
  },
  emailVerified: Date,
  accounts: [{ type: Schema.Types.ObjectId, ref: 'Account' }],
  sessions: [{ type: Schema.Types.ObjectId, ref: 'Session' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true,
  indexes: [
    { email: 1 },
    { roles: 1 },
    { 'profile.location.coordinates': '2dsphere' },
    { 'printShopProfile.verificationStatus': 1 },
    { createdAt: -1 }
  ]
});

export const User = model<IUser>('User', userSchema);
```

### Content Schema
```typescript
// models/Content.ts
import { Schema, model, Document } from 'mongoose';

interface IContent extends Document {
  title: string;
  description: string;
  creator: Schema.Types.ObjectId;
  // Educational metadata
  metadata: {
    subject: string;
    gradeLevel: string;
    curriculumAlignment: string[];
    topics: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    estimatedPages: number;
    language: string;
  };
  // File information
  files: {
    original: {
      url: string;
      filename: string;
      size: number;
      mimeType: string;
      checksum: string;
    };
    processed: {
      thumbnail: string;
      preview: string;
      optimized?: string;
    };
    uploadedAt: Date;
  };
  // Pricing and licensing
  pricing: {
    basePrice: number; // Creator's base price
    royaltyPercentage: number; // Creator's percentage (default 50%)
    minimumPrice: number;
    currency: string;
  };
  licensing: {
    type: 'standard' | 'extended' | 'exclusive';
    terms: string;
    allowCommercialUse: boolean;
    allowModification: boolean;
  };
  // Content status and moderation
  status: 'draft' | 'pending' | 'published' | 'rejected' | 'archived';
  moderationNotes?: string;
  // Analytics and performance
  stats: {
    views: number;
    downloads: number;
    orders: number;
    revenue: number;
    averageRating: number;
    totalRatings: number;
  };
  // SEO and discovery
  tags: string[];
  searchKeywords: string[];
  isVisible: boolean;
  isFeatured: boolean;
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

const contentSchema = new Schema<IContent>({
  title: { type: String, required: true, text: true },
  description: { type: String, required: true, text: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: {
    subject: { type: String, required: true },
    gradeLevel: { type: String, required: true },
    curriculumAlignment: [String],
    topics: [String],
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], required: true },
    estimatedPages: { type: Number, required: true },
    language: { type: String, default: 'en' }
  },
  files: {
    original: {
      url: { type: String, required: true },
      filename: { type: String, required: true },
      size: { type: Number, required: true },
      mimeType: { type: String, required: true },
      checksum: { type: String, required: true }
    },
    processed: {
      thumbnail: String,
      preview: String,
      optimized: String
    },
    uploadedAt: { type: Date, default: Date.now }
  },
  pricing: {
    basePrice: { type: Number, required: true, min: 0 },
    royaltyPercentage: { type: Number, default: 50, min: 0, max: 100 },
    minimumPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'USD' }
  },
  licensing: {
    type: { type: String, enum: ['standard', 'extended', 'exclusive'], default: 'standard' },
    terms: String,
    allowCommercialUse: { type: Boolean, default: true },
    allowModification: { type: Boolean, default: false }
  },
  status: { type: String, enum: ['draft', 'pending', 'published', 'rejected', 'archived'], default: 'draft' },
  moderationNotes: String,
  stats: {
    views: { type: Number, default: 0 },
    downloads: { type: Number, default: 0 },
    orders: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 }
  },
  tags: [String],
  searchKeywords: [String],
  isVisible: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  publishedAt: Date
}, {
  timestamps: true,
  indexes: [
    { title: 'text', description: 'text', tags: 'text' },
    { creator: 1 },
    { status: 1 },
    { 'metadata.subject': 1 },
    { 'metadata.gradeLevel': 1 },
    { 'stats.orders': -1 },
    { publishedAt: -1 },
    { isFeatured: -1 }
  ]
});

export const Content = model<IContent>('Content', contentSchema);
```

### Order Schema
```typescript
// models/Order.ts
import { Schema, model, Document } from 'mongoose';

interface IOrder extends Document {
  orderNumber: string;
  customer: Schema.Types.ObjectId;
  printShop: Schema.Types.ObjectId;
  
  // Order items
  items: Array<{
    content?: Schema.Types.ObjectId; // For creator content
    customFile?: {
      url: string;
      filename: string;
      pages: number;
    };
    quantity: number;
    printOptions: {
      color: boolean;
      paperSize: string;
      paperType: string;
      binding?: string;
      sides: 'single' | 'double';
    };
    pricing: {
      contentPrice: number; // Creator content price
      printingCost: number; // Print shop cost
      creatorRoyalty: number;
      platformFee: number;
      total: number;
    };
  }>;
  
  // Order totals
  totals: {
    subtotal: number;
    printingCosts: number;
    creatorRoyalties: number;
    platformFees: number;
    taxes: number;
    total: number;
    currency: string;
  };
  
  // Delivery information
  delivery: {
    method: 'pickup' | 'delivery';
    address?: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      coordinates?: [number, number];
    };
    instructions?: string;
    estimatedCompletion: Date;
    actualCompletion?: Date;
  };
  
  // Order status and tracking
  status: 'submitted' | 'accepted' | 'rejected' | 'in_progress' | 'ready' | 'completed' | 'cancelled';
  statusHistory: Array<{
    status: string;
    timestamp: Date;
    note?: string;
    updatedBy: Schema.Types.ObjectId;
  }>;
  
  // Communication
  messages: Array<{
    sender: Schema.Types.ObjectId;
    message: string;
    timestamp: Date;
    type: 'message' | 'status_update' | 'system';
  }>;
  
  // Payment information
  payment: {
    stripePaymentIntentId: string;
    status: 'pending' | 'paid' | 'refunded' | 'failed';
    paidAt?: Date;
    refundedAt?: Date;
    refundReason?: string;
  };
  
  // Quality and feedback
  feedback?: {
    customer: {
      rating: number;
      review: string;
      photos?: string[];
      submittedAt: Date;
    };
    printShop: {
      rating: number;
      review: string;
      submittedAt: Date;
    };
  };
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>({
  orderNumber: { type: String, required: true, unique: true },
  customer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  printShop: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  items: [{
    content: { type: Schema.Types.ObjectId, ref: 'Content' },
    customFile: {
      url: String,
      filename: String,
      pages: Number
    },
    quantity: { type: Number, required: true, min: 1 },
    printOptions: {
      color: { type: Boolean, default: false },
      paperSize: { type: String, required: true },
      paperType: { type: String, required: true },
      binding: String,
      sides: { type: String, enum: ['single', 'double'], default: 'single' }
    },
    pricing: {
      contentPrice: { type: Number, default: 0 },
      printingCost: { type: Number, required: true },
      creatorRoyalty: { type: Number, default: 0 },
      platformFee: { type: Number, required: true },
      total: { type: Number, required: true }
    }
  }],
  
  totals: {
    subtotal: { type: Number, required: true },
    printingCosts: { type: Number, required: true },
    creatorRoyalties: { type: Number, default: 0 },
    platformFees: { type: Number, required: true },
    taxes: { type: Number, default: 0 },
    total: { type: Number, required: true },
    currency: { type: String, default: 'USD' }
  },
  
  delivery: {
    method: { type: String, enum: ['pickup', 'delivery'], required: true },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      coordinates: [Number]
    },
    instructions: String,
    estimatedCompletion: { type: Date, required: true },
    actualCompletion: Date
  },
  
  status: { 
    type: String, 
    enum: ['submitted', 'accepted', 'rejected', 'in_progress', 'ready', 'completed', 'cancelled'],
    default: 'submitted'
  },
  statusHistory: [{
    status: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  }],
  
  messages: [{
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['message', 'status_update', 'system'], default: 'message' }
  }],
  
  payment: {
    stripePaymentIntentId: { type: String, required: true },
    status: { type: String, enum: ['pending', 'paid', 'refunded', 'failed'], default: 'pending' },
    paidAt: Date,
    refundedAt: Date,
    refundReason: String
  },
  
  feedback: {
    customer: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      photos: [String],
      submittedAt: Date
    },
    printShop: {
      rating: { type: Number, min: 1, max: 5 },
      review: String,
      submittedAt: Date
    }
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  indexes: [
    { orderNumber: 1 },
    { customer: 1 },
    { printShop: 1 },
    { status: 1 },
    { createdAt: -1 },
    { 'payment.status': 1 },
    { 'delivery.estimatedCompletion': 1 }
  ]
});

// Generate unique order number
orderSchema.pre('save', async function() {
  if (this.isNew) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
});

export const Order = model<IOrder>('Order', orderSchema);
```

### Payment Transaction Schema
```typescript
// models/PaymentTransaction.ts
import { Schema, model, Document } from 'mongoose';

interface IPaymentTransaction extends Document {
  order: Schema.Types.ObjectId;
  stripePaymentIntentId: string;
  stripeChargeId?: string;
  
  // Transaction amounts
  amounts: {
    total: number;
    platformFee: number;
    creatorRoyalties: Array<{
      creator: Schema.Types.ObjectId;
      amount: number;
      stripeTransferId?: string;
    }>;
    printShopPayment: {
      printShop: Schema.Types.ObjectId;
      amount: number;
      stripeTransferId?: string;
    };
    currency: string;
  };
  
  // Transaction status
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'partially_refunded';
  
  // Timing
  createdAt: Date;
  processedAt?: Date;
  completedAt?: Date;
  
  // Error handling
  errors?: Array<{
    message: string;
    code: string;
    timestamp: Date;
  }>;
  
  // Refund information
  refunds?: Array<{
    amount: number;
    reason: string;
    stripeRefundId: string;
    processedAt: Date;
  }>;
}

const paymentTransactionSchema = new Schema<IPaymentTransaction>({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
  stripePaymentIntentId: { type: String, required: true },
  stripeChargeId: String,
  
  amounts: {
    total: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    creatorRoyalties: [{
      creator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
      stripeTransferId: String
    }],
    printShopPayment: {
      printShop: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      amount: { type: Number, required: true },
      stripeTransferId: String
    },
    currency: { type: String, default: 'USD' }
  },
  
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  createdAt: { type: Date, default: Date.now },
  processedAt: Date,
  completedAt: Date,
  
  errors: [{
    message: String,
    code: String,
    timestamp: { type: Date, default: Date.now }
  }],
  
  refunds: [{
    amount: Number,
    reason: String,
    stripeRefundId: String,
    processedAt: Date
  }]
}, {
  timestamps: true,
  indexes: [
    { order: 1 },
    { stripePaymentIntentId: 1 },
    { status: 1 },
    { createdAt: -1 }
  ]
});

export const PaymentTransaction = model<IPaymentTransaction>('PaymentTransaction', paymentTransactionSchema);
```

## API Architecture

### Authentication Middleware
```typescript
// middleware/auth.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { User } from '@/models/User';

export interface AuthenticatedRequest extends NextRequest {
  user: {
    id: string;
    email: string;
    roles: string[];
  };
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>,
  requiredRoles?: string[]
) {
  return async (req: NextRequest) => {
    try {
      const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await User.findById(token.sub).select('roles email');
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      // Check required roles
      if (requiredRoles && !requiredRoles.some(role => user.roles.includes(role))) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }

      // Attach user to request
      (req as AuthenticatedRequest).user = {
        id: user._id.toString(),
        email: user.email,
        roles: user.roles
      };

      return handler(req as AuthenticatedRequest);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
    }
  };
}

// Rate limiting middleware
export async function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  limit: number = 100,
  windowMs: number = 15 * 60 * 1000 // 15 minutes
) {
  return async (req: NextRequest) => {
    const ip = req.ip || 'unknown';
    const key = `ratelimit:${ip}`;
    
    // Implementation would use Redis in production
    // For demo purposes, showing the structure
    
    return handler(req);
  };
}
```

### Core API Routes

#### User Management API
```typescript
// app/api/users/profile/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { User } from '@/models/User';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  profile: z.object({
    bio: z.string().max(500).optional(),
    location: z.object({
      address: z.string().optional(),
      city: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
    preferences: z.object({
      notifications: z.object({
        email: z.boolean().optional(),
        push: z.boolean().optional(),
      }).optional(),
      language: z.string().optional(),
      currency: z.string().optional(),
    }).optional(),
  }).optional(),
});

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const user = await User.findById(req.user.id).select('-sessions -accounts');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
});

export const PATCH = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const validatedData = updateProfileSchema.parse(body);

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: validatedData },
      { new: true, runValidators: true }
    ).select('-sessions -accounts');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    
    console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
});
```

#### Content Management API
```typescript
// app/api/content/upload/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { Content } from '@/models/Content';
import { generatePresignedUrl, processUploadedFile } from '@/lib/cloudflare-r2';
import { z } from 'zod';

const uploadRequestSchema = z.object({
  filename: z.string(),
  contentType: z.string(),
  size: z.number().max(100 * 1024 * 1024), // 100MB max
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user.roles.includes('creator')) {
      return NextResponse.json({ error: 'Creator role required' }, { status: 403 });
    }

    const body = await req.json();
    const { filename, contentType, size } = uploadRequestSchema.parse(body);

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Generate unique file path
    const fileId = crypto.randomUUID();
    const filePath = `content/${req.user.id}/${fileId}/${filename}`;

    // Generate presigned URL for direct upload
    const presignedUrl = await generatePresignedUrl(filePath, contentType);

    return NextResponse.json({
      uploadUrl: presignedUrl,
      fileId,
      filePath
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    
    console.error('Upload URL generation error:', error);
    return NextResponse.json({ error: 'Failed to generate upload URL' }, { status: 500 });
  }
}, ['creator']);

// app/api/content/create/route.ts
const createContentSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  fileId: z.string().uuid(),
  filePath: z.string(),
  metadata: z.object({
    subject: z.string(),
    gradeLevel: z.string(),
    curriculumAlignment: z.array(z.string()).optional(),
    topics: z.array(z.string()).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    estimatedPages: z.number().int().positive(),
    language: z.string().default('en'),
  }),
  pricing: z.object({
    basePrice: z.number().positive(),
    royaltyPercentage: z.number().min(0).max(100).default(50),
    minimumPrice: z.number().positive(),
  }),
  tags: z.array(z.string()).max(10),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user.roles.includes('creator')) {
      return NextResponse.json({ error: 'Creator role required' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createContentSchema.parse(body);

    // Verify file was uploaded successfully
    const fileExists = await verifyFileExists(validatedData.filePath);
    if (!fileExists) {
      return NextResponse.json({ error: 'File not found. Please upload the file first.' }, { status: 400 });
    }

    // Create content record
    const content = new Content({
      ...validatedData,
      creator: req.user.id,
      files: {
        original: {
          url: `https://cdn.example.com/${validatedData.filePath}`,
          filename: validatedData.filePath.split('/').pop(),
          size: 0, // Will be updated by background processing
          mimeType: 'application/pdf',
          checksum: '', // Will be calculated by background processing
        },
        uploadedAt: new Date(),
      },
      status: 'pending', // Requires moderation
    });

    await content.save();

    // Trigger background processing
    await processUploadedFile(validatedData.filePath, content._id);

    return NextResponse.json({ content }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    
    console.error('Create content error:', error);
    return NextResponse.json({ error: 'Failed to create content' }, { status: 500 });
  }
}, ['creator']);
```

#### Search and Discovery API
```typescript
// app/api/content/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Content } from '@/models/Content';
import { z } from 'zod';

const searchSchema = z.object({
  q: z.string().optional(),
  subject: z.string().optional(),
  gradeLevel: z.string().optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  tags: z.array(z.string()).optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(50).default(20),
  sortBy: z.enum(['relevance', 'newest', 'price_low', 'price_high', 'rating', 'popular']).default('relevance'),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    
    // Parse arrays from query strings
    if (params.tags) {
      params.tags = params.tags.split(',');
    }

    const validatedParams = searchSchema.parse(params);
    const { q, subject, gradeLevel, difficulty, minPrice, maxPrice, tags, page, limit, sortBy } = validatedParams;

    // Build MongoDB query
    const query: any = { status: 'published', isVisible: true };

    // Text search
    if (q) {
      query.$text = { $search: q };
    }

    // Filters
    if (subject) query['metadata.subject'] = subject;
    if (gradeLevel) query['metadata.gradeLevel'] = gradeLevel;
    if (difficulty) query['metadata.difficulty'] = difficulty;
    if (tags && tags.length > 0) query.tags = { $in: tags };
    
    // Price range
    if (minPrice || maxPrice) {
      query['pricing.basePrice'] = {};
      if (minPrice) query['pricing.basePrice'].$gte = minPrice;
      if (maxPrice) query['pricing.basePrice'].$lte = maxPrice;
    }

    // Sorting
    let sort: any = {};
    switch (sortBy) {
      case 'newest':
        sort = { publishedAt: -1 };
        break;
      case 'price_low':
        sort = { 'pricing.basePrice': 1 };
        break;
      case 'price_high':
        sort = { 'pricing.basePrice': -1 };
        break;
      case 'rating':
        sort = { 'stats.averageRating': -1 };
        break;
      case 'popular':
        sort = { 'stats.orders': -1 };
        break;
      default:
        if (q) {
          sort = { score: { $meta: 'textScore' } };
        } else {
          sort = { publishedAt: -1 };
        }
    }

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const [content, total] = await Promise.all([
      Content.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('creator', 'name profile.avatar creatorProfile.verificationStatus')
        .select('-files.original.checksum'),
      Content.countDocuments(query)
    ]);

    return NextResponse.json({
      content,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      filters: {
        subjects: await getUniqueValues('metadata.subject'),
        gradeLevels: await getUniqueValues('metadata.gradeLevel'),
        difficulties: ['beginner', 'intermediate', 'advanced'],
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid parameters', details: error.errors }, { status: 400 });
    }
    
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

async function getUniqueValues(field: string) {
  return Content.distinct(field, { status: 'published', isVisible: true });
}
```

#### Order Management API
```typescript
// app/api/orders/create/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { Order } from '@/models/Order';
import { Content } from '@/models/Content';
import { User } from '@/models/User';
import { z } from 'zod';

const createOrderSchema = z.object({
  printShopId: z.string(),
  items: z.array(z.object({
    contentId: z.string().optional(),
    customFile: z.object({
      url: z.string(),
      filename: z.string(),
      pages: z.number().int().positive(),
    }).optional(),
    quantity: z.number().int().positive(),
    printOptions: z.object({
      color: z.boolean(),
      paperSize: z.string(),
      paperType: z.string(),
      binding: z.string().optional(),
      sides: z.enum(['single', 'double']),
    }),
  })),
  delivery: z.object({
    method: z.enum(['pickup', 'delivery']),
    address: z.object({
      street: z.string(),
      city: z.string(),
      state: z.string(),
      zipCode: z.string(),
      country: z.string(),
    }).optional(),
    instructions: z.string().optional(),
  }),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user.roles.includes('customer')) {
      return NextResponse.json({ error: 'Customer role required' }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = createOrderSchema.parse(body);

    // Verify print shop exists and is verified
    const printShop = await User.findOne({
      _id: validatedData.printShopId,
      roles: 'printShop',
      'printShopProfile.verificationStatus': 'verified',
      isActive: true
    });

    if (!printShop) {
      return NextResponse.json({ error: 'Print shop not found or not verified' }, { status: 400 });
    }

    // Calculate pricing for each item
    const processedItems = await Promise.all(
      validatedData.items.map(async (item) => {
        let contentPrice = 0;
        let creatorRoyalty = 0;
        
        if (item.contentId) {
          const content = await Content.findById(item.contentId);
          if (!content || content.status !== 'published') {
            throw new Error(`Content ${item.contentId} not found or not published`);
          }
          contentPrice = content.pricing.basePrice;
          creatorRoyalty = (contentPrice * content.pricing.royaltyPercentage) / 100;
        }

        // Calculate printing cost based on print shop pricing
        const { color, paperSize, paperType, sides } = item.printOptions;
        const baseRate = color ? printShop.printShopProfile.pricing.color : printShop.printShopProfile.pricing.blackWhite;
        const pages = item.customFile?.pages || 1;
        const printingCost = baseRate * pages * item.quantity * (sides === 'double' ? 0.8 : 1);

        const subtotal = contentPrice + printingCost;
        const platformFee = subtotal * 0.15; // 15% platform commission
        const total = subtotal + platformFee;

        return {
          ...item,
          pricing: {
            contentPrice,
            printingCost,
            creatorRoyalty,
            platformFee,
            total,
          },
        };
      })
    );

    // Calculate order totals
    const totals = processedItems.reduce(
      (acc, item) => ({
        subtotal: acc.subtotal + item.pricing.contentPrice + item.pricing.printingCost,
        printingCosts: acc.printingCosts + item.pricing.printingCost,
        creatorRoyalties: acc.creatorRoyalties + item.pricing.creatorRoyalty,
        platformFees: acc.platformFees + item.pricing.platformFee,
        total: acc.total + item.pricing.total,
        taxes: 0, // TODO: Implement tax calculation
        currency: 'USD',
      }),
      {
        subtotal: 0,
        printingCosts: 0,
        creatorRoyalties: 0,
        platformFees: 0,
        total: 0,
        taxes: 0,
        currency: 'USD',
      }
    );

    // Create order
    const order = new Order({
      customer: req.user.id,
      printShop: validatedData.printShopId,
      items: processedItems,
      totals,
      delivery: {
        ...validatedData.delivery,
        estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
      statusHistory: [{
        status: 'submitted',
        timestamp: new Date(),
        updatedBy: req.user.id,
      }],
    });

    await order.save();

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}, ['customer']);
```

#### Payment Processing API
```typescript
// app/api/payments/create-intent/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { Order } from '@/models/Order';
import { stripe } from '@/lib/stripe';
import { z } from 'zod';

const createPaymentIntentSchema = z.object({
  orderId: z.string(),
});

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    const { orderId } = createPaymentIntentSchema.parse(body);

    // Fetch order with populated data
    const order = await Order.findOne({
      _id: orderId,
      customer: req.user.id,
      status: 'submitted'
    }).populate('printShop');

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totals.total * 100), // Convert to cents
      currency: order.totals.currency.toLowerCase(),
      metadata: {
        orderId: order._id.toString(),
        customerId: order.customer.toString(),
        printShopId: order.printShop._id.toString(),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    order.payment = {
      stripePaymentIntentId: paymentIntent.id,
      status: 'pending',
    };
    await order.save();

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }
    
    console.error('Create payment intent error:', error);
    return NextResponse.json({ error: 'Failed to create payment intent' }, { status: 500 });
  }
}, ['customer']);

// app/api/payments/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { Order } from '@/models/Order';
import { PaymentTransaction } from '@/models/PaymentTransaction';
import { Content } from '@/models/Content';
import { User } from '@/models/User';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const orderId = paymentIntent.metadata.orderId;
  
  const order = await Order.findById(orderId)
    .populate('printShop')
    .populate('items.content');

  if (!order) {
    console.error('Order not found for payment intent:', paymentIntent.id);
    return;
  }

  // Update order payment status
  order.payment.status = 'paid';
  order.payment.paidAt = new Date();
  order.status = 'accepted'; // Automatically accept paid orders
  order.statusHistory.push({
    status: 'accepted',
    timestamp: new Date(),
    note: 'Payment received - order automatically accepted',
    updatedBy: order.printShop._id,
  });

  await order.save();

  // Create payment transaction record
  const transaction = new PaymentTransaction({
    order: order._id,
    stripePaymentIntentId: paymentIntent.id,
    stripeChargeId: paymentIntent.latest_charge,
    amounts: {
      total: order.totals.total,
      platformFee: order.totals.platformFees,
      creatorRoyalties: order.items
        .filter(item => item.content)
        .map(item => ({
          creator: item.content.creator,
          amount: item.pricing.creatorRoyalty,
        })),
      printShopPayment: {
        printShop: order.printShop._id,
        amount: order.totals.printingCosts,
      },
      currency: order.totals.currency,
    },
    status: 'completed',
    processedAt: new Date(),
    completedAt: new Date(),
  });

  await transaction.save();

  // TODO: Trigger transfers to connected accounts
  // TODO: Send notifications to all parties
}

async function handlePaymentFailure(paymentIntent: any) {
  const orderId = paymentIntent.metadata.orderId;
  
  const order = await Order.findById(orderId);
  if (!order) return;

  order.payment.status = 'failed';
  order.status = 'cancelled';
  order.statusHistory.push({
    status: 'cancelled',
    timestamp: new Date(),
    note: 'Payment failed',
    updatedBy: order.customer,
  });

  await order.save();

  // TODO: Send failure notification to customer
}
```

## File Processing Pipeline with Cloudflare R2

### R2 Configuration and Utilities
```typescript
// lib/cloudflare-r2.ts
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!;

export async function generatePresignedUrl(filePath: string, contentType: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
    ContentType: contentType,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 minutes
}

export async function getFileUrl(filePath: string): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: filePath,
  });

  return getSignedUrl(r2Client, command, { expiresIn: 3600 }); // 1 hour
}

export async function verifyFileExists(filePath: string): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filePath,
    });
    
    await r2Client.send(command);
    return true;
  } catch (error) {
    return false;
  }
}

// Cloudflare Worker for file processing
export async function processUploadedFile(filePath: string, contentId: string) {
  // This would trigger a Cloudflare Worker or background job
  const response = await fetch(`${process.env.WORKER_URL}/process-file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.WORKER_TOKEN}`,
    },
    body: JSON.stringify({
      filePath,
      contentId,
    }),
  });

  if (!response.ok) {
    throw new Error('File processing failed');
  }

  return response.json();
}
```

### Cloudflare Worker for File Processing
```javascript
// cloudflare-worker/file-processor.js
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { filePath, contentId } = await request.json();
    
    // Download file from R2
    const fileResponse = await R2.get(filePath);
    if (!fileResponse) {
      return new Response('File not found', { status: 404 });
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    
    // Process based on file type
    const contentType = fileResponse.httpMetadata.contentType;
    
    if (contentType === 'application/pdf') {
      await processPDF(fileBuffer, filePath, contentId);
    } else if (contentType.startsWith('image/')) {
      await processImage(fileBuffer, filePath, contentId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Processing error:', error);
    return new Response('Processing failed', { status: 500 });
  }
}

async function processPDF(buffer, originalPath, contentId) {
  // Generate thumbnail using pdf-lib or similar
  const thumbnail = await generatePDFThumbnail(buffer);
  const preview = await generatePDFPreview(buffer);
  
  // Upload processed files back to R2
  const basePath = originalPath.replace(/\/[^/]+$/, '');
  
  await R2.put(`${basePath}/thumbnail.jpg`, thumbnail, {
    httpMetadata: { contentType: 'image/jpeg' }
  });
  
  await R2.put(`${basePath}/preview.jpg`, preview, {
    httpMetadata: { contentType: 'image/jpeg' }
  });

  // Update database via API
  await fetch(`${API_BASE_URL}/api/content/${contentId}/processing-complete`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({
      thumbnail: `${basePath}/thumbnail.jpg`,
      preview: `${basePath}/preview.jpg`,
      pages: await getPDFPageCount(buffer),
      size: buffer.byteLength,
    }),
  });
}

async function generatePDFThumbnail(buffer) {
  // Implementation using pdf-lib or similar
  // Return thumbnail as JPEG buffer
}

async function generatePDFPreview(buffer) {
  // Implementation to generate first page preview
  // Return preview as JPEG buffer
}
```

## Real-Time Features Implementation

### Server-Sent Events for Order Tracking
```typescript
// app/api/orders/[id]/events/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { Order } from '@/models/Order';

export const GET = withAuth(async (req: AuthenticatedRequest) => {
  const { pathname } = new URL(req.url);
  const orderId = pathname.split('/')[3]; // Extract order ID from path

  try {
    // Verify user has access to this order
    const order = await Order.findOne({
      _id: orderId,
      $or: [
        { customer: req.user.id },
        { printShop: req.user.id }
      ]
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Create SSE stream
    const stream = new ReadableStream({
      start(controller) {
        // Send initial order status
        const data = `data: ${JSON.stringify({
          type: 'status',
          status: order.status,
          timestamp: new Date().toISOString()
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(data));

        // Set up MongoDB change stream
        const changeStream = Order.watch([
          { $match: { 'fullDocument._id': order._id } }
        ]);

        changeStream.on('change', (change) => {
          if (change.operationType === 'update' && change.fullDocument) {
            const eventData = `data: ${JSON.stringify({
              type: 'update',
              order: change.fullDocument,
              timestamp: new Date().toISOString()
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(eventData));
          }
        });

        // Cleanup on close
        req.signal.addEventListener('abort', () => {
          changeStream.close();
          controller.close();
        });
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('SSE error:', error);
    return NextResponse.json({ error: 'Failed to establish event stream' }, { status: 500 });
  }
});
```

### Push Notification System
```typescript
// lib/notifications.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:' + process.env.VAPID_EMAIL,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: any;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export async function sendPushNotification(
  subscription: any,
  payload: NotificationPayload
) {
  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify(payload)
    );
  } catch (error) {
    console.error('Push notification error:', error);
  }
}

// Notification templates for different events
export const NotificationTemplates = {
  orderStatusChanged: (orderNumber: string, status: string): NotificationPayload => ({
    title: 'Order Update',
    body: `Order ${orderNumber} is now ${status}`,
    icon: '/icon-192x192.png',
    data: { orderNumber, type: 'order_update' },
    actions: [
      { action: 'view', title: 'View Order' },
      { action: 'close', title: 'Dismiss' }
    ]
  }),

  newOrder: (orderNumber: string, customerName: string): NotificationPayload => ({
    title: 'New Order Received',
    body: `New order ${orderNumber} from ${customerName}`,
    icon: '/icon-192x192.png',
    data: { orderNumber, type: 'new_order' },
    actions: [
      { action: 'accept', title: 'Accept' },
      { action: 'view', title: 'View Details' }
    ]
  }),

  paymentReceived: (orderNumber: string, amount: number): NotificationPayload => ({
    title: 'Payment Received',
    body: `Payment of $${amount} received for order ${orderNumber}`,
    icon: '/icon-192x192.png',
    data: { orderNumber, type: 'payment' }
  })
};

// Background job for sending notifications
export async function processNotificationQueue() {
  // This would be implemented as a background job
  // using a queue system like Bull or Agenda
}
```

### Client-Side Real-Time Integration
```typescript
// hooks/useOrderTracking.ts
import { useEffect, useState } from 'react';
import { Order } from '@/types';

export function useOrderTracking(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');

  useEffect(() => {
    if (!orderId) return;

    setConnectionStatus('connecting');
    
    const eventSource = new EventSource(`/api/orders/${orderId}/events`);

    eventSource.onopen = () => {
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'update') {
        setOrder(data.order);
      } else if (data.type === 'status') {
        // Handle initial status
      }
    };

    eventSource.onerror = () => {
      setConnectionStatus('disconnected');
    };

    return () => {
      eventSource.close();
      setConnectionStatus('disconnected');
    };
  }, [orderId]);

  return { order, connectionStatus };
}

// Push notification registration
export function usePushNotifications() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    setSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const subscribe = async () => {
    if (!supported) return null;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      });

      // Send subscription to server
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub)
      });

      setSubscription(sub);
      return sub;
    } catch (error) {
      console.error('Push subscription error:', error);
      return null;
    }
  };

  return { subscription, supported, subscribe };
}
```

## Stripe Connect Integration

### Account Onboarding
```typescript
// app/api/payments/connect/onboard/route.ts
import { NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/middleware/auth';
import { stripe } from '@/lib/stripe';
import { User } from '@/models/User';

export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    if (!req.user.roles.includes('creator') && !req.user.roles.includes('printShop')) {
      return NextResponse.json({ error: 'Invalid role for payment onboarding' }, { status: 403 });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let stripeAccountId = user.creatorProfile?.stripeAccountId || user.printShopProfile?.stripeAccountId;

    // Create Stripe Express account if doesn't exist
    if (!stripeAccountId) {
      const account = await stripe.accounts.create({
        type: 'express',
        country: user.profile.location?.country || 'US',
        email: user.email,
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_type: req.user.roles.includes('printShop') ? 'company' : 'individual',
        metadata: {
          userId: user._id.toString(),
          role: req.user.roles.includes('printShop') ? 'printShop' : 'creator',
        },
      });

      stripeAccountId = account.id;

      // Update user record
      if (req.user.roles.includes('creator')) {
        user.creatorProfile!.stripeAccountId = stripeAccountId;
      } else {
        user.printShopProfile!.stripeAccountId = stripeAccountId;
      }
      await user.save();
    }

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payments/onboard?refresh=true`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard/payments/onboard?success=true`,
      type: 'account_onboarding',
    });

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error('Stripe onboarding error:', error);
    return NextResponse.json({ error: 'Failed to create onboarding link' }, { status: 500 });
  }
}, ['creator', 'printShop']);
```

### Payment Splitting Implementation
```typescript
// lib/payment-splitting.ts
import { stripe } from './stripe';
import { Order } from '@/models/Order';
import { PaymentTransaction } from '@/models/PaymentTransaction';

export async function processOrderPayment(orderId: string) {
  const order = await Order.findById(orderId)
    .populate('customer')
    .populate('printShop')
    .populate('items.content');

  if (!order || order.payment.status !== 'paid') {
    throw new Error('Order not found or not paid');
  }

  const transaction = await PaymentTransaction.findOne({ order: orderId });
  if (!transaction) {
    throw new Error('Transaction record not found');
  }

  try {
    // Transfer to print shop
    const printShopTransfer = await stripe.transfers.create({
      amount: Math.round(transaction.amounts.printShopPayment.amount * 100),
      currency: transaction.amounts.currency.toLowerCase(),
      destination: order.printShop.printShopProfile.stripeAccountId,
      metadata: {
        orderId: order._id.toString(),
        type: 'print_shop_payment',
      },
    });

    transaction.amounts.printShopPayment.stripeTransferId = printShopTransfer.id;

    // Transfer to content creators
    for (const royalty of transaction.amounts.creatorRoyalties) {
      const creator = await User.findById(royalty.creator);
      if (creator?.creatorProfile?.stripeAccountId) {
        const creatorTransfer = await stripe.transfers.create({
          amount: Math.round(royalty.amount * 100),
          currency: transaction.amounts.currency.toLowerCase(),
          destination: creator.creatorProfile.stripeAccountId,
          metadata: {
            orderId: order._id.toString(),
            creatorId: creator._id.toString(),
            type: 'creator_royalty',
          },
        });

        royalty.stripeTransferId = creatorTransfer.id;
      }
    }

    transaction.status = 'completed';
    transaction.completedAt = new Date();
    await transaction.save();

    // Update creator earnings
    for (const item of order.items) {
      if (item.content) {
        await User.findByIdAndUpdate(item.content.creator, {
          $inc: {
            'creatorProfile.earnings.total': item.pricing.creatorRoyalty,
            'creatorProfile.earnings.thisMonth': item.pricing.creatorRoyalty,
          },
        });
      }
    }

  } catch (error) {
    transaction.status = 'failed';
    transaction.errors = transaction.errors || [];
    transaction.errors.push({
      message: error.message,
      code: error.code || 'unknown',
      timestamp: new Date(),
    });
    await transaction.save();

    throw error;
  }
}

// Handle refunds
export async function processRefund(orderId: string, amount: number, reason: string) {
  const order = await Order.findById(orderId);
  const transaction = await PaymentTransaction.findOne({ order: orderId });

  if (!order || !transaction) {
    throw new Error('Order or transaction not found');
  }

  try {
    // Create Stripe refund
    const refund = await stripe.refunds.create({
      payment_intent: transaction.stripePaymentIntentId,
      amount: Math.round(amount * 100),
      reason: 'requested_by_customer',
      metadata: {
        orderId: order._id.toString(),
        reason,
      },
    });

    // Record refund
    transaction.refunds = transaction.refunds || [];
    transaction.refunds.push({
      amount,
      reason,
      stripeRefundId: refund.id,
      processedAt: new Date(),
    });

    // Update status
    const totalRefunded = transaction.refunds.reduce((sum, r) => sum + r.amount, 0);
    if (totalRefunded >= transaction.amounts.total) {
      transaction.status = 'refunded';
      order.payment.status = 'refunded';
      order.payment.refundedAt = new Date();
      order.payment.refundReason = reason;
    } else {
      transaction.status = 'partially_refunded';
    }

    await Promise.all([transaction.save(), order.save()]);

    return refund;
  } catch (error) {
    console.error('Refund processing error:', error);
    throw error;
  }
}
```

## Security Implementation

### Input Validation and Sanitization
```typescript
// lib/validation.ts
import { z } from 'zod';
import DOMPurify from 'isomorphic-dompurify';

// Common validation schemas
export const commonSchemas = {
  email: z.string().email().max(255),
  password: z.string().min(8).max(128).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
  objectId: z.string().regex(/^[0-9a-fA-F]{24}$/),
  url: z.string().url().max(2048),
  phoneNumber: z.string().regex(/^\+[1-9]\d{1,14}$/),
  currency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD']),
};

// File upload validation
export const fileValidation = {
  allowedTypes: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
  ],
  maxSize: 100 * 1024 * 1024, // 100MB
  
  validateFile: (file: File) => {
    if (!fileValidation.allowedTypes.includes(file.type)) {
      throw new Error('Unsupported file type');
    }
    if (file.size > fileValidation.maxSize) {
      throw new Error('File too large');
    }
    return true;
  },
};

// Content sanitization
export function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: [],
  });
}

export function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[^a-zA-Z0-9\s\-\_]/g, '') // Remove special chars except basic ones
    .trim()
    .substring(0, 100); // Limit length
}

// Rate limiting utilities
export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  constructor(
    private maxAttempts: number,
    private windowMs: number
  ) {}

  isLimited(identifier: string): boolean {
    const now = Date.now();
    const attempt = this.attempts.get(identifier);

    if (!attempt || now > attempt.resetTime) {
      this.attempts.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs,
      });
      return false;
    }

    if (attempt.count >= this.maxAttempts) {
      return true;
    }

    attempt.count++;
    return false;
  }

  reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
}

// API request validation middleware
export function validateRequest<T extends z.ZodType>(schema: T) {
  return async (request: Request): Promise<z.infer<T>> => {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
      }
      throw new Error('Invalid request body');
    }
  };
}
```

### Role-Based Access Control
```typescript
// lib/rbac.ts
export enum Permission {
  // Content permissions
  CREATE_CONTENT = 'content:create',
  READ_CONTENT = 'content:read',
  UPDATE_CONTENT = 'content:update',
  DELETE_CONTENT = 'content:delete',
  MODERATE_CONTENT = 'content:moderate',

  // Order permissions
  CREATE_ORDER = 'order:create',
  READ_ORDER = 'order:read',
  UPDATE_ORDER = 'order:update',
  ACCEPT_ORDER = 'order:accept',
  FULFILL_ORDER = 'order:fulfill',

  // Payment permissions
  PROCESS_PAYMENT = 'payment:process',
  VIEW_TRANSACTIONS = 'payment:view',
  ISSUE_REFUND = 'payment:refund',

  // User permissions
  MANAGE_PROFILE = 'user:manage_profile',
  VIEW_ANALYTICS = 'user:analytics',
  MODERATE_USERS = 'user:moderate',

  // Admin permissions
  PLATFORM_ADMIN = 'platform:admin',
  VIEW_ALL_DATA = 'platform:view_all',
  SYSTEM_CONFIG = 'platform:config',
}

export const RolePermissions: Record<string, Permission[]> = {
  customer: [
    Permission.CREATE_ORDER,
    Permission.READ_ORDER,
    Permission.READ_CONTENT,
    Permission.MANAGE_PROFILE,
    Permission.VIEW_ANALYTICS,
  ],
  
  creator: [
    Permission.CREATE_CONTENT,
    Permission.READ_CONTENT,
    Permission.UPDATE_CONTENT,
    Permission.DELETE_CONTENT,
    Permission.MANAGE_PROFILE,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_TRANSACTIONS,
  ],
  
  printShop: [
    Permission.READ_ORDER,
    Permission.UPDATE_ORDER,
    Permission.ACCEPT_ORDER,
    Permission.FULFILL_ORDER,
    Permission.READ_CONTENT,
    Permission.MANAGE_PROFILE,
    Permission.VIEW_ANALYTICS,
    Permission.VIEW_TRANSACTIONS,
  ],
  
  admin: [
    Permission.PLATFORM_ADMIN,
    Permission.VIEW_ALL_DATA,
    Permission.SYSTEM_CONFIG,
    Permission.MODERATE_CONTENT,
    Permission.MODERATE_USERS,
    Permission.ISSUE_REFUND,
  ],
};

export function hasPermission(userRoles: string[], permission: Permission): boolean {
  return userRoles.some(role => 
    RolePermissions[role]?.includes(permission)
  );
}

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest) => {
    if (!hasPermission(req.user.roles, permission)) {
      throw new Error(`Insufficient permissions. Required: ${permission}`);
    }
  };
}

// Resource-based access control
export async function canAccessOrder(userId: string, orderId: string): Promise<boolean> {
  const order = await Order.findById(orderId);
  if (!order) return false;

  const user = await User.findById(userId);
  if (!user) return false;

  // Users can access orders they're involved in
  if (order.customer.toString() === userId || order.printShop.toString() === userId) {
    return true;
  }

  // Admins can access all orders
  if (user.roles.includes('admin')) {
    return true;
  }

  return false;
}

export async function canAccessContent(userId: string, contentId: string): Promise<boolean> {
  const content = await Content.findById(contentId);
  if (!content) return false;

  const user = await User.findById(userId);
  if (!user) return false;

  // Published content is accessible to all
  if (content.status === 'published' && content.isVisible) {
    return true;
  }

  // Creators can access their own content
  if (content.creator.toString() === userId) {
    return true;
  }

  // Admins can access all content
  if (user.roles.includes('admin')) {
    return true;
  }

  return false;
}
```

### Security Headers and Configuration
```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP header
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self'",
    "connect-src 'self' https://api.stripe.com",
    "frame-src https://js.stripe.com",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // API route protection
  if (request.nextUrl.pathname.startsWith('/api/')) {
    // Skip auth endpoints
    if (request.nextUrl.pathname.startsWith('/api/auth/') || 
        request.nextUrl.pathname === '/api/health') {
      return response;
    }

    // Check authentication for protected API routes
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/api/((?!auth|health|webhooks).*)',
    '/dashboard/:path*',
  ],
};
```

## Deployment and Scaling

### Environment Configuration
```bash
# .env.local
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/printing-marketplace
MONGODB_DB_NAME=printing-marketplace

# Authentication
NEXTAUTH_URL=https://yourapp.vercel.app
NEXTAUTH_SECRET=your-super-secret-key

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Cloudflare R2
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET_NAME=printing-marketplace-files

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_live_your-publishable-key
STRIPE_SECRET_KEY=sk_live_your-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret

# Email
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=587
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password

# Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_EMAIL=contact@yourapp.com

# Workers
WORKER_URL=https://your-worker.workers.dev
WORKER_TOKEN=your-worker-auth-token
API_TOKEN=your-api-auth-token
```

### Vercel Deployment Configuration
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NEXTAUTH_SECRET": "@nextauth-secret",
    "STRIPE_SECRET_KEY": "@stripe-secret-key"
  },
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["iad1", "sfo1", "fra1"],
  "crons": [
    {
      "path": "/api/cron/process-payments",
      "schedule": "0 */6 * * *"
    },
    {
      "path": "/api/cron/cleanup-files",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### MongoDB Atlas Configuration
```javascript
// Database indexes for optimal performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ roles: 1 });
db.users.createIndex({ "profile.location.coordinates": "2dsphere" });
db.users.createIndex({ "printShopProfile.verificationStatus": 1 });

db.content.createIndex({ title: "text", description: "text", tags: "text" });
db.content.createIndex({ creator: 1 });
db.content.createIndex({ status: 1, isVisible: 1 });
db.content.createIndex({ "metadata.subject": 1 });
db.content.createIndex({ "metadata.gradeLevel": 1 });
db.content.createIndex({ publishedAt: -1 });

db.orders.createIndex({ orderNumber: 1 }, { unique: true });
db.orders.createIndex({ customer: 1 });
db.orders.createIndex({ printShop: 1 });
db.orders.createIndex({ status: 1 });
db.orders.createIndex({ createdAt: -1 });

db.paymenttransactions.createIndex({ order: 1 });
db.paymenttransactions.createIndex({ stripePaymentIntentId: 1 });
db.paymenttransactions.createIndex({ status: 1 });
```

### Scaling Considerations

#### Database Scaling
```typescript
// Connection pooling configuration
const mongoOptions = {
  maxPoolSize: 10, // Maximum number of connections
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  bufferCommands: false,
};

// Read preference for analytics queries
const analyticsQueries = {
  readPreference: 'secondary',
  readConcern: { level: 'majority' },
};
```

#### CDN and Caching Strategy
```typescript
// lib/cache.ts
export const cacheConfig = {
  content: {
    ttl: 60 * 60, // 1 hour
    tags: ['content'],
  },
  printShops: {
    ttl: 30 * 60, // 30 minutes
    tags: ['printShops'],
  },
  analytics: {
    ttl: 24 * 60 * 60, // 24 hours
    tags: ['analytics'],
  },
};

// Edge caching for static content
export function getCacheHeaders(type: keyof typeof cacheConfig) {
  const config = cacheConfig[type];
  return {
    'Cache-Control': `public, s-maxage=${config.ttl}, stale-while-revalidate=86400`,
    'CDN-Cache-Control': `public, max-age=${config.ttl}`,
  };
}
```

## Implementation Roadmap

### Epic 1: Platform Foundation (Weeks 1-6)

#### Week 1-2: Project Setup
- [ ] Initialize Next.js project with TypeScript
- [ ] Set up MongoDB Atlas cluster and connection
- [ ] Configure shadcn/ui and Tailwind CSS
- [ ] Implement basic NextAuth.js authentication
- [ ] Set up GitHub Actions CI/CD pipeline
- [ ] Deploy to Vercel with environment variables

#### Week 3-4: User Management
- [ ] Implement user registration with role selection
- [ ] Create user profile schemas and APIs
- [ ] Build role-specific profile components
- [ ] Implement email verification
- [ ] Add OAuth providers (Google, GitHub)
- [ ] Create user dashboard layouts

#### Week 5-6: Core Infrastructure
- [ ] Set up Cloudflare R2 integration
- [ ] Implement file upload utilities
- [ ] Create responsive landing page
- [ ] Add navigation and routing
- [ ] Implement basic search functionality
- [ ] Set up error handling and logging

### Epic 2: Content & Orders (Weeks 7-14)

#### Week 7-8: Content Management
- [ ] Build content upload system
- [ ] Implement file processing pipeline
- [ ] Create content metadata forms
- [ ] Set up content moderation workflow
- [ ] Build content discovery interface
- [ ] Implement search and filtering

#### Week 9-10: Print Shop Management
- [ ] Create print shop registration flow
- [ ] Build shop profile management
- [ ] Implement pricing configuration
- [ ] Add business verification system
- [ ] Create shop directory and maps
- [ ] Build capacity management tools

#### Week 11-12: Order Workflow
- [ ] Implement order creation system
- [ ] Build order management dashboard
- [ ] Create status tracking system
- [ ] Implement real-time notifications
- [ ] Add messaging between parties
- [ ] Build order history and analytics

#### Week 13-14: Real-time Features
- [ ] Set up Server-Sent Events
- [ ] Implement push notifications
- [ ] Create WebSocket fallbacks
- [ ] Build notification preferences
- [ ] Add email notification system
- [ ] Test real-time functionality

### Epic 3: Payments & Operations (Weeks 15-20)

#### Week 15-16: Payment Integration
- [ ] Set up Stripe Connect accounts
- [ ] Implement payment intent creation
- [ ] Build checkout flow
- [ ] Set up webhook handling
- [ ] Implement payment splitting
- [ ] Add refund processing

#### Week 17-18: Analytics & Reporting
- [ ] Build creator analytics dashboard
- [ ] Implement print shop metrics
- [ ] Create admin reporting tools
- [ ] Add revenue tracking
- [ ] Build performance insights
- [ ] Implement data export features

#### Week 19-20: Quality & Launch Prep
- [ ] Implement dispute resolution system
- [ ] Add content moderation tools
- [ ] Build admin panel
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Security audit and fixes

### Post-Launch Optimization (Weeks 21+)
- [ ] User feedback integration
- [ ] A/B testing implementation
- [ ] Advanced search algorithms
- [ ] Mobile app development
- [ ] International expansion features
- [ ] Advanced analytics and ML

## Testing Strategy

### Unit Testing
```typescript
// __tests__/api/orders/create.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/orders/create/route';
import { Order } from '@/models/Order';
import { User } from '@/models/User';

jest.mock('@/models/Order');
jest.mock('@/models/User');
jest.mock('@/middleware/auth');

describe('/api/orders/create', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates order successfully', async () => {
    const mockUser = {
      _id: 'user123',
      roles: ['customer'],
    };

    const mockPrintShop = {
      _id: 'shop123',
      printShopProfile: {
        pricing: { blackWhite: 0.10, color: 0.25 },
        verificationStatus: 'verified',
      },
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockPrintShop);
    (Order.prototype.save as jest.Mock).mockResolvedValue({
      _id: 'order123',
      orderNumber: 'ORD-123',
    });

    const { req } = createMocks({
      method: 'POST',
      body: {
        printShopId: 'shop123',
        items: [{
          quantity: 10,
          printOptions: {
            color: false,
            paperSize: 'A4',
            paperType: 'regular',
            sides: 'single',
          },
        }],
        delivery: {
          method: 'pickup',
        },
      },
    });

    // Mock authenticated request
    (req as any).user = mockUser;

    const response = await POST(req as any);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.order).toBeDefined();
    expect(data.order.orderNumber).toBe('ORD-123');
  });

  it('rejects order for unverified print shop', async () => {
    const mockUser = {
      _id: 'user123',
      roles: ['customer'],
    };

    (User.findOne as jest.Mock).mockResolvedValue(null);

    const { req } = createMocks({
      method: 'POST',
      body: {
        printShopId: 'shop123',
        items: [],
        delivery: { method: 'pickup' },
      },
    });

    (req as any).user = mockUser;

    const response = await POST(req as any);
    expect(response.status).toBe(400);
  });
});
```

### Integration Testing
```typescript
// __tests__/integration/order-workflow.test.ts
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { User } from '@/models/User';
import { Order } from '@/models/Order';
import { PaymentTransaction } from '@/models/PaymentTransaction';

describe('Order Workflow Integration', () => {
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Order.deleteMany({});
    await PaymentTransaction.deleteMany({});
  });

  it('completes full order workflow', async () => {
    // Create test users
    const customer = new User({
      email: 'customer@test.com',
      name: 'Test Customer',
      roles: ['customer'],
    });
    await customer.save();

    const printShop = new User({
      email: 'shop@test.com',
      name: 'Test Shop',
      roles: ['printShop'],
      printShopProfile: {
        businessName: 'Test Print Shop',
        pricing: { blackWhite: 0.10, color: 0.25 },
        verificationStatus: 'verified',
      },
    });
    await printShop.save();

    // Create order
    const order = new Order({
      customer: customer._id,
      printShop: printShop._id,
      items: [{
        quantity: 10,
        printOptions: {
          color: false,
          paperSize: 'A4',
          paperType: 'regular',
          sides: 'single',
        },
        pricing: {
          contentPrice: 0,
          printingCost: 1.0,
          creatorRoyalty: 0,
          platformFee: 0.15,
          total: 1.15,
        },
      }],
      totals: {
        subtotal: 1.0,
        printingCosts: 1.0,
        creatorRoyalties: 0,
        platformFees: 0.15,
        total: 1.15,
        taxes: 0,
        currency: 'USD',
      },
      delivery: {
        method: 'pickup',
        estimatedCompletion: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
      payment: {
        stripePaymentIntentId: 'pi_test_123',
        status: 'pending',
      },
    });
    await order.save();

    // Verify order was created
    expect(order.orderNumber).toMatch(/^ORD-/);
    expect(order.status).toBe('submitted');

    // Simulate payment success
    order.payment.status = 'paid';
    order.payment.paidAt = new Date();
    order.status = 'accepted';
    await order.save();

    // Verify payment processing
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder?.payment.status).toBe('paid');
    expect(updatedOrder?.status).toBe('accepted');
  });
});
```

### End-to-End Testing with Playwright
```typescript
// e2e/order-creation.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Order Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as customer
    await page.goto('/auth/signin');
    await page.fill('[data-testid=email]', 'customer@test.com');
    await page.fill('[data-testid=password]', 'password123');
    await page.click('[data-testid=submit]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('customer can create order', async ({ page }) => {
    // Navigate to content
    await page.goto('/content');
    
    // Search for content
    await page.fill('[data-testid=search-input]', 'mathematics');
    await page.click('[data-testid=search-button]');
    
    // Select content
    await page.click('[data-testid=content-card]:first-child');
    await expect(page).toHaveURL(/\/content\/[a-f0-9]{24}/);
    
    // Select print options
    await page.click('[data-testid=print-button]');
    await page.selectOption('[data-testid=print-shop]', { index: 0 });
    await page.fill('[data-testid=quantity]', '5');
    await page.check('[data-testid=color-printing]');
    
    // Proceed to checkout
    await page.click('[data-testid=add-to-cart]');
    await page.click('[data-testid=checkout]');
    
    // Fill delivery information
    await page.click('[data-testid=pickup-method]');
    await page.fill('[data-testid=special-instructions]', 'Please call when ready');
    
    // Submit order
    await page.click('[data-testid=submit-order]');
    
    // Verify order creation
    await expect(page).toHaveURL(/\/orders\/[a-f0-9]{24}/);
    await expect(page.locator('[data-testid=order-status]')).toHaveText('Submitted');
    await expect(page.locator('[data-testid=order-total]')).toContainText('$');
  });

  test('customer receives real-time updates', async ({ page }) => {
    // Create order first (setup)
    // ... order creation steps ...

    // Navigate to order tracking
    await page.goto('/orders/test-order-id');
    
    // Verify initial status
    await expect(page.locator('[data-testid=order-status]')).toHaveText('Submitted');
    
    // Simulate print shop accepting order (via API call)
    await page.evaluate(async () => {
      await fetch('/api/orders/test-order-id/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });
    });
    
    // Verify real-time update
    await expect(page.locator('[data-testid=order-status]')).toHaveText('Accepted', { timeout: 5000 });
    await expect(page.locator('[data-testid=status-notification]')).toBeVisible();
  });
});
```

This comprehensive technical architecture provides a solid foundation for building the printing marketplace platform. The implementation follows modern best practices for security, scalability, and maintainability while addressing all the requirements outlined in the PRD.

Key strengths of this architecture:
1. **Scalable database design** with proper indexing and relationships
2. **Secure API architecture** with role-based access control
3. **Efficient file processing** using Cloudflare R2 and Workers
4. **Robust payment system** with Stripe Connect for marketplace functionality
5. **Real-time capabilities** for order tracking and notifications
6. **Comprehensive security** measures throughout the stack
7. **Clear implementation roadmap** with specific deliverables and timelines

The development team can follow this architecture directly to build a production-ready marketplace platform.