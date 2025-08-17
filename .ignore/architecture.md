# Full-Stack Architecture Specification
## Printing Marketplace Platform

### Executive Summary

This document outlines the comprehensive full-stack architecture for a three-sided marketplace platform connecting students/businesses, print shops, and content creators. The architecture leverages modern serverless technologies with Next.js 15, MongoDB Atlas, and Stripe Connect to deliver same-day local printing fulfillment with content creator monetization.

**Target Metrics:**
- $1M ARR within 18 months (15-20% platform commission)
- 10,000 active customers, 500 content creators, 50+ print shops within 24 months
- Sub-3 second page load times, 99%+ uptime
- Support for 1000+ concurrent users

---

## Core Technology Stack

### Frontend Layer
```typescript
// Next.js 15 with App Router
- Framework: Next.js 15+ with App Router
- Language: TypeScript for type safety
- UI Library: shadcn/ui components with Tailwind CSS
- Forms: React Hook Form with Zod validation
- State Management: React Server Components + Client Components pattern
- Routing: File-system based routing with dynamic segments
```

### Backend Layer
```typescript
// API Architecture
- API Layer: Next.js API Routes (/api/*)
- Authentication: NextAuth.js v5 with multi-provider support
- Database: MongoDB Atlas with Mongoose ODM
- File Storage: Cloudflare R2 with CDN
- Email Service: SMTP2GO for transactional emails
- Payment Processing: Stripe Connect for marketplace payments
```

### Infrastructure Layer
```yaml
# Deployment & Hosting
- Hosting: Vercel (automatic scaling, edge optimization)
- Database: MongoDB Atlas (managed, global clusters)
- CDN: Cloudflare R2 + Cloudflare CDN
- Monitoring: Vercel Analytics + custom dashboards
- Security: Cloudflare security features (DDoS, WAF)
```

---

## Database Architecture

### Core Collections Schema

#### Users Collection
```typescript
interface User {
  _id: ObjectId
  email: string (unique, required)
  name?: string
  image?: string
  role: 'customer' | 'creator' | 'printShop' | 'admin'
  emailVerified?: Date
  
  // Role-specific fields
  profile?: {
    // Customer fields
    location?: {
      address: string
      city: string
      coordinates: [number, number] // [lng, lat]
    }
    
    // Creator fields
    bio?: string
    specializations?: string[]
    portfolio?: string[]
    
    // Print Shop fields
    businessInfo?: {
      name: string
      description: string
      capabilities: string[]
      equipment: string[]
      hours: {
        [day: string]: { open: string; close: string }
      }
      pricing: {
        [service: string]: number
      }
    }
    isVerified?: boolean
  }
  
  preferences: {
    notifications: {
      email: boolean
      orderUpdates: boolean
      marketing: boolean
    }
  }
  
  createdAt: Date
  updatedAt: Date
}
```

#### Content Collection
```typescript
interface Content {
  _id: ObjectId
  title: string
  description: string
  creatorId: ObjectId (ref: User)
  
  metadata: {
    subject: string
    gradeLevel: string[]
    curriculum: string[]
    tags: string[]
    fileType: string
    fileSize: number
    pageCount?: number
  }
  
  file: {
    url: string // Cloudflare R2 URL
    cdnUrl: string // CDN optimized URL
    key: string // R2 object key
    previewUrl?: string
  }
  
  pricing: {
    basePrice: number
    markup: {
      color: number
      binding: number
    }
  }
  
  stats: {
    views: number
    orders: number
    rating: number
    reviewCount: number
  }
  
  status: 'draft' | 'pending' | 'approved' | 'rejected'
  moderationNotes?: string
  
  createdAt: Date
  updatedAt: Date
}
```

#### Orders Collection
```typescript
interface Order {
  _id: ObjectId
  orderNumber: string (unique)
  
  customer: {
    userId: ObjectId (ref: User)
    contactInfo: {
      name: string
      email: string
      phone?: string
    }
    deliveryAddress?: Address
  }
  
  items: [{
    contentId?: ObjectId (ref: Content) // null for customer uploads
    creatorId?: ObjectId (ref: User)
    fileUrl: string
    fileName: string
    specifications: {
      quantity: number
      colorOption: 'bw' | 'color'
      paperSize: string
      binding?: string
      customInstructions?: string
    }
    pricing: {
      contentCost: number
      printingCost: number
      total: number
    }
  }]
  
  printShop: {
    shopId: ObjectId (ref: User)
    estimatedCompletion: Date
    actualCompletion?: Date
  }
  
  delivery: {
    method: 'pickup' | 'delivery'
    address?: Address
    instructions?: string
  }
  
  status: 'pending' | 'accepted' | 'in_progress' | 'ready' | 'completed' | 'cancelled'
  statusHistory: [{
    status: string
    timestamp: Date
    note?: string
  }]
  
  payment: {
    stripePaymentIntentId: string
    amount: number
    currency: string
    platformFee: number
    creatorFee: number
    shopFee: number
    status: 'pending' | 'succeeded' | 'failed'
  }
  
  quality: {
    customerRating?: number
    customerReview?: string
    issues?: [{
      type: string
      description: string
      resolution?: string
      timestamp: Date
    }]
  }
  
  createdAt: Date
  updatedAt: Date
}
```

### Database Indexes
```javascript
// Performance optimization indexes
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1 })
db.users.createIndex({ "profile.location.coordinates": "2dsphere" })

db.content.createIndex({ creatorId: 1 })
db.content.createIndex({ "metadata.subject": 1, "metadata.gradeLevel": 1 })
db.content.createIndex({ status: 1, createdAt: -1 })
db.content.createIndex({ "$text": { title: 1, description: 1, "metadata.tags": 1 } })

db.orders.createIndex({ "customer.userId": 1, createdAt: -1 })
db.orders.createIndex({ "printShop.shopId": 1, status: 1 })
db.orders.createIndex({ orderNumber: 1 }, { unique: true })
db.orders.createIndex({ status: 1, createdAt: -1 })
```

---

## Authentication Architecture

### NextAuth.js v5 Configuration
```typescript
// auth.ts
import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)
const db = client.db()

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(db),
  providers: [
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: "customer" // default role
        }
      }
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Custom authentication logic
        const user = await authenticateUser(credentials.email, credentials.password)
        return user || null
      }
    })
  ],
  
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.userId = user.id
      }
      return token
    },
    
    session({ session, token }) {
      if (token) {
        session.user.id = token.userId as string
        session.user.role = token.role as string
      }
      return session
    }
  },
  
  pages: {
    signIn: '/auth/signin',
    signUp: '/auth/signup'
  }
})
```

### Role-Based Access Control
```typescript
// middleware.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const userRole = req.auth?.user?.role

  // Admin routes
  if (pathname.startsWith('/admin')) {
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Print shop routes
  if (pathname.startsWith('/shop-dashboard')) {
    if (userRole !== 'printShop') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  // Creator routes
  if (pathname.startsWith('/creator-dashboard')) {
    if (userRole !== 'creator') {
      return NextResponse.redirect(new URL('/unauthorized', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/shop-dashboard/:path*', '/creator-dashboard/:path*']
}
```

---

## API Architecture

### Core API Routes Structure
```
/api/
├── auth/           # NextAuth.js endpoints
├── users/          # User management
│   ├── profile     # GET, PUT /api/users/profile
│   ├── [id]        # GET /api/users/[id]
│   └── verification # POST /api/users/verification
├── content/        # Content management
│   ├── upload      # POST /api/content/upload
│   ├── [id]        # GET, PUT, DELETE /api/content/[id]
│   ├── search      # GET /api/content/search
│   └── moderate    # PUT /api/content/moderate (admin only)
├── orders/         # Order management
│   ├── create      # POST /api/orders/create
│   ├── [id]        # GET, PUT /api/orders/[id]
│   ├── status      # PUT /api/orders/[id]/status
│   └── history     # GET /api/orders/history
├── payments/       # Payment processing
│   ├── intent      # POST /api/payments/intent
│   ├── confirm     # POST /api/payments/confirm
│   ├── webhooks    # POST /api/payments/webhooks
│   └── payouts     # GET, POST /api/payments/payouts
├── shops/          # Print shop management
│   ├── directory   # GET /api/shops/directory
│   ├── [id]        # GET /api/shops/[id]
│   ├── capacity    # GET, PUT /api/shops/[id]/capacity
│   └── onboard     # POST /api/shops/onboard
├── admin/          # Administrative functions
│   ├── analytics   # GET /api/admin/analytics
│   ├── users       # GET /api/admin/users
│   └── moderation  # GET, PUT /api/admin/moderation
└── monitoring/     # Health and monitoring
    ├── health      # GET /api/monitoring/health
    └── metrics     # GET /api/monitoring/metrics
```

### Sample API Route Implementation
```typescript
// /api/orders/create/route.ts
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import { createOrder } from "@/lib/services/orders"
import { OrderCreateSchema } from "@/lib/validations/orders"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = OrderCreateSchema.parse(body)
    
    const order = await createOrder({
      ...validatedData,
      customerId: session.user.id
    })

    return NextResponse.json({ order }, { status: 201 })
    
  } catch (error) {
    console.error("Order creation failed:", error)
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
```

---

## File Management Architecture

### Cloudflare R2 Integration
```typescript
// lib/storage/r2.ts
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!
  }
})

export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
) {
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    Metadata: {
      uploadedAt: new Date().toISOString()
    }
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

export async function generatePresignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
) {
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key
  })

  return await getSignedUrl(r2Client, command, { expiresIn })
}

// CDN URL for public access
export function getCDNUrl(key: string): string {
  return `https://${process.env.R2_CUSTOM_DOMAIN}/${key}`
}
```

### File Upload API Route
```typescript
// /api/content/upload/route.ts
export async function POST(request: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'creator') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { fileName, fileType, fileSize } = await request.json()
  
  // Validate file
  const allowedTypes = ['application/pdf', 'application/msword', 'image/jpeg', 'image/png']
  const maxSize = 50 * 1024 * 1024 // 50MB
  
  if (!allowedTypes.includes(fileType) || fileSize > maxSize) {
    return NextResponse.json({ error: "Invalid file" }, { status: 400 })
  }

  // Generate unique key
  const key = `content/${session.user.id}/${Date.now()}-${fileName}`
  
  // Generate presigned URL
  const uploadUrl = await generatePresignedUploadUrl(key, fileType)
  
  return NextResponse.json({
    uploadUrl,
    key,
    cdnUrl: getCDNUrl(key)
  })
}
```

---

## Payment Architecture

### Stripe Connect Implementation
```typescript
// lib/payments/stripe.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20'
})

export async function createConnectedAccount(
  email: string,
  businessType: 'individual' | 'company',
  country: string = 'US'
) {
  return await stripe.accounts.create({
    type: 'express',
    email,
    business_type: businessType,
    country,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true }
    }
  })
}

export async function createPaymentIntentWithSplit(
  amount: number,
  currency: string,
  customerId: string,
  transfers: {
    destination: string // Connected account ID
    amount: number      // Amount to transfer (excluding platform fee)
  }[]
) {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    payment_method_types: ['card'],
    transfer_group: `order_${Date.now()}`,
    application_fee_amount: amount - transfers.reduce((sum, t) => sum + t.amount, 0),
    metadata: {
      orderType: 'printing'
    }
  })
}

export async function createTransfer(
  amount: number,
  currency: string,
  destination: string,
  sourceTransaction: string
) {
  return await stripe.transfers.create({
    amount,
    currency,
    destination,
    source_transaction: sourceTransaction
  })
}
```

### Revenue Splitting Logic
```typescript
// lib/services/payment-splitting.ts
interface OrderPayment {
  totalAmount: number
  contentCreatorId?: string
  printShopId: string
  platformFeePercentage: number // 15-20%
}

export function calculateRevenueSplit(payment: OrderPayment) {
  const { totalAmount, platformFeePercentage } = payment
  
  const platformFee = Math.round(totalAmount * (platformFeePercentage / 100))
  const remainingAmount = totalAmount - platformFee
  
  // Split remaining between creator and print shop
  const creatorFee = payment.contentCreatorId 
    ? Math.round(remainingAmount * 0.3) // 30% to creator
    : 0
  
  const printShopFee = remainingAmount - creatorFee
  
  return {
    platformFee,
    creatorFee,
    printShopFee,
    transfers: [
      ...(payment.contentCreatorId ? [{
        destination: payment.contentCreatorId,
        amount: creatorFee
      }] : []),
      {
        destination: payment.printShopId,
        amount: printShopFee
      }
    ]
  }
}
```

---

## Email Architecture

### SMTP2GO Integration
```typescript
// lib/email/smtp2go.ts
interface EmailTemplate {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
  customHeaders?: Record<string, string>
}

export async function sendEmail(template: EmailTemplate) {
  const response = await fetch('https://api.smtp2go.com/v3/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Smtp2go-Api-Key': process.env.SMTP2GO_API_KEY!
    },
    body: JSON.stringify({
      api_key: process.env.SMTP2GO_API_KEY,
      to: [template.to],
      sender: process.env.FROM_EMAIL,
      subject: template.subject,
      html_body: template.htmlBody,
      text_body: template.textBody,
      custom_headers: template.customHeaders
    })
  })

  if (!response.ok) {
    throw new Error(`Email sending failed: ${response.statusText}`)
  }

  return await response.json()
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (order: Order) => ({
    subject: `Order Confirmation - ${order.orderNumber}`,
    htmlBody: `
      <h1>Order Confirmed</h1>
      <p>Your order ${order.orderNumber} has been confirmed.</p>
      <p>Estimated completion: ${order.printShop.estimatedCompletion}</p>
    `,
    textBody: `Order ${order.orderNumber} confirmed. Estimated completion: ${order.printShop.estimatedCompletion}`
  }),

  orderStatusUpdate: (order: Order, newStatus: string) => ({
    subject: `Order Update - ${order.orderNumber}`,
    htmlBody: `
      <h1>Order Status Update</h1>
      <p>Your order ${order.orderNumber} is now: ${newStatus}</p>
    `,
    textBody: `Order ${order.orderNumber} status: ${newStatus}`
  })
}
```

---

## Security Architecture

### Input Validation with Zod
```typescript
// lib/validations/orders.ts
import { z } from 'zod'

export const OrderCreateSchema = z.object({
  items: z.array(z.object({
    contentId: z.string().optional(),
    fileUrl: z.string().url(),
    fileName: z.string().min(1),
    specifications: z.object({
      quantity: z.number().min(1).max(1000),
      colorOption: z.enum(['bw', 'color']),
      paperSize: z.enum(['A4', 'A3', 'Letter', 'Legal']),
      binding: z.enum(['none', 'staple', 'spiral', 'perfect']).optional(),
      customInstructions: z.string().max(500).optional()
    }),
    pricing: z.object({
      contentCost: z.number().min(0),
      printingCost: z.number().min(0),
      total: z.number().min(0)
    })
  })).min(1),
  printShopId: z.string(),
  delivery: z.object({
    method: z.enum(['pickup', 'delivery']),
    address: z.object({
      street: z.string(),
      city: z.string(),
      postalCode: z.string(),
      country: z.string()
    }).optional(),
    instructions: z.string().max(200).optional()
  })
})
```

### Rate Limiting
```typescript
// lib/security/rate-limiting.ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!
})

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
  analytics: true
})

// API route protection
export async function withRateLimit(
  request: NextRequest,
  handler: Function
) {
  const identifier = request.ip ?? '127.0.0.1'
  const { success } = await ratelimit.limit(identifier)
  
  if (!success) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      { status: 429 }
    )
  }
  
  return handler()
}
```

---

## Performance & Monitoring

### Performance Optimization
```typescript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: ['@/components', '@/lib']
  },
  images: {
    domains: [process.env.R2_CUSTOM_DOMAIN],
    formats: ['image/webp', 'image/avif']
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
  }
}

module.exports = nextConfig
```

### Health Check API
```typescript
// /api/monitoring/health/route.ts
export async function GET() {
  const checks = await Promise.allSettled([
    // Database connectivity
    mongoose.connection.readyState === 1,
    
    // R2 connectivity
    r2Client.send(new HeadBucketCommand({ Bucket: process.env.R2_BUCKET_NAME })),
    
    // SMTP2GO connectivity
    fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: { 'X-Smtp2go-Api-Key': process.env.SMTP2GO_API_KEY! }
    })
  ])

  const health = {
    status: checks.every(check => check.status === 'fulfilled') ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    services: {
      database: checks[0].status === 'fulfilled',
      storage: checks[1].status === 'fulfilled',
      email: checks[2].status === 'fulfilled'
    }
  }

  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  })
}
```

---

## Deployment Architecture

### Environment Configuration
```bash
# .env.local
# Database
MONGODB_URI=mongodb+srv://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=...

# Authentication
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...

# Storage
R2_ACCOUNT_ID=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=...
R2_CUSTOM_DOMAIN=...

# Payments
STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...

# Email
SMTP2GO_API_KEY=...
FROM_EMAIL=...

# Monitoring
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
```

### Vercel Deployment Configuration
```json
// vercel.json
{
  "functions": {
    "app/api/**": {
      "maxDuration": 60
    }
  },
  "env": {
    "MONGODB_URI": "@mongodb-uri",
    "NEXTAUTH_SECRET": "@nextauth-secret"
  },
  "regions": ["iad1"],
  "framework": "nextjs"
}
```

---

## Testing Strategy

### API Route Testing
```typescript
// __tests__/api/orders.test.ts
import { POST } from '@/app/api/orders/create/route'
import { auth } from '@/auth'

jest.mock('@/auth')
const mockAuth = auth as jest.MockedFunction<typeof auth>

describe('/api/orders/create', () => {
  beforeEach(() => {
    mockAuth.mockResolvedValue({
      user: { id: 'user-123', role: 'customer' }
    } as any)
  })

  it('creates order successfully', async () => {
    const request = new Request('http://localhost:3000/api/orders/create', {
      method: 'POST',
      body: JSON.stringify({
        items: [{
          fileUrl: 'https://example.com/file.pdf',
          fileName: 'document.pdf',
          specifications: {
            quantity: 10,
            colorOption: 'bw',
            paperSize: 'A4'
          },
          pricing: {
            contentCost: 0,
            printingCost: 5.00,
            total: 5.00
          }
        }],
        printShopId: 'shop-123',
        delivery: {
          method: 'pickup'
        }
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.order).toBeDefined()
  })
})
```

---

## Conclusion

This architecture provides a robust, scalable foundation for the three-sided printing marketplace with:

- **Modern Development Stack**: Next.js 15, TypeScript, MongoDB Atlas
- **Serverless Scalability**: Vercel deployment with automatic scaling
- **Secure Payments**: Stripe Connect for marketplace revenue splitting
- **Global Performance**: Cloudflare R2 CDN and edge optimization
- **Comprehensive Monitoring**: Health checks, analytics, and error tracking

The architecture supports the business requirements of achieving $1M ARR with 15-20% platform commission while maintaining sub-3 second load times and 99%+ uptime for 10,000+ users across three distinct user roles.