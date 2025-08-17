# Complete Full-Stack Architecture
## Printing Marketplace Platform

### Executive Summary

This document outlines the comprehensive full-stack architecture for a three-sided marketplace platform connecting students/businesses, print shops, and content creators. The architecture leverages modern serverless technologies with Next.js 15, MongoDB Atlas, and Stripe Connect to deliver same-day local printing fulfillment with content creator monetization, while providing consistent user experiences through a robust design system built on shadcn/ui.

**Target Metrics:**
- $1M ARR within 18 months (15-20% platform commission)
- 10,000 active customers, 500 content creators, 50+ print shops within 24 months
- Sub-3 second page load times, 99%+ uptime
- Support for 1000+ concurrent users

**Key Features:**
- Three-sided marketplace with role-based interfaces
- Same-day local fulfillment as key differentiator
- Content creator monetization through print-on-demand revenue sharing
- Comprehensive order tracking and quality assurance
- Mobile-first responsive design with accessibility compliance

---

## Table of Contents

1. [Core Technology Stack](#core-technology-stack)
2. [Database Architecture](#database-architecture)
3. [Authentication Architecture](#authentication-architecture)
4. [API Architecture](#api-architecture)
5. [File Management Architecture](#file-management-architecture)
6. [Payment Architecture](#payment-architecture)
7. [Email Architecture](#email-architecture)
8. [UI/UX Design System](#uiux-design-system)
9. [Component Architecture](#component-architecture)
10. [Navigation Architecture](#navigation-architecture)
11. [Form Architecture](#form-architecture)
12. [Responsive Design System](#responsive-design-system)
13. [Accessibility Implementation](#accessibility-implementation)
14. [Security Architecture](#security-architecture)
15. [Performance & Monitoring](#performance--monitoring)
16. [Deployment Architecture](#deployment-architecture)
17. [Testing Strategy](#testing-strategy)

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

## UI/UX Design System

### Design System Foundation

#### Core Design Principles
```typescript
// Design Philosophy
const designPrinciples = {
  // Mobile-first approach for student demographic
  mobilePriority: "Touch-optimized interface with thumb-friendly navigation",
  
  // Progressive disclosure for complex workflows
  informationArchitecture: "Essential info first, detailed options on demand",
  
  // Visual clarity for urgent printing needs
  visualHierarchy: "Clear status indicators, ratings, and availability",
  
  // Role-specific optimization
  contextualDesign: "Customized interfaces for each user segment",
  
  // Efficiency for repeat users
  streamlinedActions: "One-touch actions for common tasks"
}
```

#### shadcn/ui Configuration & Setup
```bash
# Initial shadcn/ui setup
npx shadcn-ui@latest init

# Core components installation
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add progress
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add skeleton
npx shadcn-ui@latest add table
npx shadcn-ui@latest add pagination
```

#### Tailwind CSS Configuration
```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Brand colors for printing marketplace
        primary: {
          50: "#eff6ff",
          100: "#dbeafe", 
          500: "#3b82f6", // Primary blue
          600: "#2563eb",
          900: "#1e3a8a"
        },
        // Status colors for order tracking
        status: {
          pending: "#f59e0b",    // amber-500
          progress: "#3b82f6",   // blue-500
          ready: "#10b981",      // emerald-500
          completed: "#059669",  // emerald-600
          cancelled: "#ef4444"   // red-500
        },
        // Role-specific accent colors
        roles: {
          customer: "#3b82f6",   // blue-500
          creator: "#8b5cf6",    // violet-500
          printShop: "#f59e0b",  // amber-500
          admin: "#6b7280"       // gray-500
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"]
      },
      spacing: {
        "18": "4.5rem",
        "88": "22rem"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite"
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

---

## Component Architecture

### Base Component Library Structure
```
components/
├── ui/                     # shadcn/ui base components
│   ├── button.tsx
│   ├── card.tsx
│   ├── form.tsx
│   └── ...
├── layout/                 # Layout components
│   ├── header.tsx
│   ├── navigation.tsx
│   ├── sidebar.tsx
│   └── footer.tsx
├── marketplace/            # Business logic components
│   ├── content-card.tsx
│   ├── shop-directory.tsx
│   ├── order-tracker.tsx
│   └── price-calculator.tsx
├── forms/                  # Form components
│   ├── upload-form.tsx
│   ├── order-form.tsx
│   └── profile-form.tsx
├── dashboards/            # Role-specific dashboards
│   ├── customer/
│   ├── creator/
│   ├── print-shop/
│   └── admin/
└── shared/                # Shared utility components
    ├── file-upload.tsx
    ├── image-gallery.tsx
    ├── rating-display.tsx
    └── status-indicator.tsx
```

### Custom Component Extensions
```typescript
// components/marketplace/content-card.tsx
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Download, Eye } from "lucide-react"

interface ContentCardProps {
  content: {
    id: string
    title: string
    description: string
    creator: string
    subject: string
    gradeLevel: string[]
    rating: number
    price: number
    thumbnail?: string
    downloadCount: number
    viewCount: number
  }
  onSelect?: (id: string) => void
  variant?: "grid" | "list"
}

export function ContentCard({ content, onSelect, variant = "grid" }: ContentCardProps) {
  return (
    <Card className={`
      group cursor-pointer transition-all duration-200 
      hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]
      ${variant === "list" ? "flex flex-row" : ""}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h3 className="font-semibold text-sm md:text-base line-clamp-2">
              {content.title}
            </h3>
            <p className="text-xs text-muted-foreground">by {content.creator}</p>
          </div>
          <Badge variant="secondary" className="text-xs">
            {content.subject}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
          {content.description}
        </p>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {content.gradeLevel.map((grade) => (
            <Badge key={grade} variant="outline" className="text-xs">
              {grade}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {content.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Download className="h-3 w-3" />
              {content.downloadCount}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {content.viewCount}
            </span>
          </div>
          <span className="font-semibold text-base text-foreground">
            ${content.price.toFixed(2)}
          </span>
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          onClick={() => onSelect?.(content.id)}
          className="w-full text-sm"
          size="sm"
        >
          Select for Printing
        </Button>
      </CardFooter>
    </Card>
  )
}
```

### Order Status Component
```typescript
// components/marketplace/order-tracker.tsx
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Printer, Package } from "lucide-react"

interface OrderStatus {
  status: 'pending' | 'accepted' | 'in_progress' | 'ready' | 'completed'
  estimatedCompletion?: Date
  progress: number
}

export function OrderTracker({ status, estimatedCompletion, progress }: OrderStatus) {
  const statusConfig = {
    pending: { 
      icon: Clock, 
      color: "bg-amber-500", 
      label: "Pending", 
      description: "Waiting for print shop confirmation" 
    },
    accepted: { 
      icon: CheckCircle, 
      color: "bg-blue-500", 
      label: "Accepted", 
      description: "Print shop confirmed your order" 
    },
    in_progress: { 
      icon: Printer, 
      color: "bg-blue-500", 
      label: "Printing", 
      description: "Your order is being printed" 
    },
    ready: { 
      icon: Package, 
      color: "bg-emerald-500", 
      label: "Ready", 
      description: "Ready for pickup/delivery" 
    },
    completed: { 
      icon: CheckCircle, 
      color: "bg-emerald-600", 
      label: "Completed", 
      description: "Order completed successfully" 
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-full ${config.color} text-white`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <Badge variant="secondary">{config.label}</Badge>
            <p className="text-sm text-muted-foreground mt-1">
              {config.description}
            </p>
          </div>
        </div>
        
        {estimatedCompletion && (
          <div className="text-right">
            <p className="text-sm font-medium">Estimated completion</p>
            <p className="text-xs text-muted-foreground">
              {estimatedCompletion.toLocaleDateString()} at{" "}
              {estimatedCompletion.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute:'2-digit' 
              })}
            </p>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  )
}
```

---

## Navigation Architecture

### Role-Based Navigation System
```typescript
// components/layout/navigation.tsx
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useSession } from "next-auth/react"

interface NavigationItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string
  roles: string[]
}

const navigationItems: NavigationItem[] = [
  {
    label: "Browse Content",
    href: "/browse",
    roles: ["customer"]
  },
  {
    label: "My Orders",
    href: "/orders",
    roles: ["customer", "creator", "printShop"]
  },
  {
    label: "Upload Content",
    href: "/creator/upload",
    roles: ["creator"]
  },
  {
    label: "My Content",
    href: "/creator/content",
    roles: ["creator"]
  },
  {
    label: "Analytics",
    href: "/creator/analytics",
    roles: ["creator"]
  },
  {
    label: "Shop Dashboard",
    href: "/shop/dashboard",
    roles: ["printShop"]
  },
  {
    label: "Order Queue",
    href: "/shop/orders",
    roles: ["printShop"]
  },
  {
    label: "Admin Panel",
    href: "/admin",
    roles: ["admin"]
  }
]

export function Navigation() {
  const { data: session } = useSession()
  const userRole = session?.user?.role

  const visibleItems = navigationItems.filter(item => 
    item.roles.includes(userRole || '')
  )

  return (
    <NavigationMenu>
      {visibleItems.map((item) => (
        <NavigationMenuItem key={item.href}>
          <NavigationMenuLink href={item.href}>
            <div className="flex items-center gap-2">
              {item.icon && <item.icon className="h-4 w-4" />}
              <span>{item.label}</span>
              {item.badge && (
                <Badge variant="secondary" className="text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
          </NavigationMenuLink>
        </NavigationMenuItem>
      ))}
    </NavigationMenu>
  )
}
```

### Mobile Navigation
```typescript
// components/layout/mobile-navigation.tsx
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export function MobileNavigation() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-80">
        <nav className="flex flex-col space-y-4">
          {/* Navigation items */}
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```

---

## Form Architecture

### Multi-Step Form Components
```typescript
// components/forms/order-form.tsx
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form"
import { Progress } from "@/components/ui/progress"
import { StepIndicator } from "./step-indicator"

const steps = [
  { id: 1, title: "Content Selection", description: "Choose your files" },
  { id: 2, title: "Print Options", description: "Configure printing" },
  { id: 3, title: "Shop Selection", description: "Choose print shop" },
  { id: 4, title: "Review", description: "Confirm order" }
]

export function OrderForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const form = useForm({
    resolver: zodResolver(orderSchema),
    mode: "onChange"
  })

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-4">
        <Progress value={progress} className="h-2" />
        <StepIndicator steps={steps} currentStep={currentStep} />
      </div>
      
      <Form {...form}>
        <form className="space-y-6">
          {currentStep === 1 && <ContentSelectionStep />}
          {currentStep === 2 && <PrintOptionsStep />}
          {currentStep === 3 && <ShopSelectionStep />}
          {currentStep === 4 && <ReviewStep />}
          
          <div className="flex justify-between">
            <Button 
              type="button"
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            <Button 
              type="button"
              onClick={() => setCurrentStep(Math.min(steps.length, currentStep + 1))}
              disabled={currentStep === steps.length}
            >
              {currentStep === steps.length ? "Place Order" : "Next"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
```

---

## Responsive Design System

### Breakpoint Strategy
```typescript
// lib/utils/responsive.ts
export const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
} as const

// Mobile-first utility classes
export const responsiveClasses = {
  // Grid systems
  grid: {
    mobile: "grid-cols-1",
    tablet: "md:grid-cols-2", 
    desktop: "lg:grid-cols-3",
    large: "xl:grid-cols-4"
  },
  
  // Typography
  heading: {
    mobile: "text-2xl",
    tablet: "md:text-3xl",
    desktop: "lg:text-4xl"
  },
  
  // Spacing
  container: {
    mobile: "px-4",
    tablet: "md:px-6",
    desktop: "lg:px-8"
  }
}
```

### Touch-Optimized Components
```typescript
// components/ui/touch-button.tsx
import { Button, ButtonProps } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface TouchButtonProps extends ButtonProps {
  touchOptimized?: boolean
}

export function TouchButton({ 
  touchOptimized = true, 
  className, 
  children, 
  ...props 
}: TouchButtonProps) {
  return (
    <Button
      className={cn(
        touchOptimized && [
          "min-h-[44px]", // Apple's recommended touch target
          "min-w-[44px]",
          "active:scale-95",
          "transition-transform duration-100"
        ],
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
}
```

---

## Accessibility Implementation

### WCAG AA Compliance
```typescript
// components/ui/accessible-card.tsx
import { Card, CardProps } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface AccessibleCardProps extends CardProps {
  ariaLabel?: string
  focusable?: boolean
  interactive?: boolean
}

export function AccessibleCard({ 
  ariaLabel,
  focusable = false,
  interactive = false,
  className,
  children,
  ...props 
}: AccessibleCardProps) {
  return (
    <Card
      role={interactive ? "button" : undefined}
      tabIndex={focusable ? 0 : undefined}
      aria-label={ariaLabel}
      className={cn(
        // Ensure sufficient color contrast
        "border-border/50",
        
        // Focus indicators
        focusable && [
          "focus:outline-none",
          "focus:ring-2",
          "focus:ring-primary",
          "focus:ring-offset-2"
        ],
        
        // Interactive states
        interactive && [
          "cursor-pointer",
          "hover:bg-muted/50",
          "transition-colors"
        ],
        
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
}
```

### Screen Reader Optimization
```typescript
// components/shared/screen-reader-text.tsx
interface ScreenReaderTextProps {
  children: React.ReactNode
}

export function ScreenReaderText({ children }: ScreenReaderTextProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  )
}

// Usage in components
export function OrderStatus({ status }: { status: string }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant={getStatusVariant(status)}>
        {status}
      </Badge>
      <ScreenReaderText>
        Order status is {status}. 
        {status === 'ready' && 'Your order is ready for pickup.'}
      </ScreenReaderText>
    </div>
  )
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

### Component Lazy Loading
```typescript
// lib/components/lazy-loading.ts
import { lazy, Suspense } from "react"
import { LoadingCard } from "@/components/ui/loading-card"

// Lazy load heavy components
export const LazyCreatorDashboard = lazy(() => 
  import("@/components/dashboards/creator/creator-dashboard")
)

export const LazyOrderForm = lazy(() => 
  import("@/components/forms/order-form")
)

// Wrapper with loading state
export function LazyComponent({ 
  Component, 
  fallback = <LoadingCard /> 
}: {
  Component: React.ComponentType
  fallback?: React.ReactNode
}) {
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  )
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

### Component Testing
```typescript
// __tests__/components/content-card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react"
import { ContentCard } from "@/components/marketplace/content-card"

const mockContent = {
  id: "1",
  title: "Math Worksheet",
  description: "Basic algebra problems",
  creator: "John Doe",
  subject: "Mathematics",
  gradeLevel: ["Grade 9", "Grade 10"],
  rating: 4.5,
  price: 2.99,
  downloadCount: 120,
  viewCount: 1500
}

describe("ContentCard", () => {
  it("renders content information correctly", () => {
    render(<ContentCard content={mockContent} />)
    
    expect(screen.getByText("Math Worksheet")).toBeInTheDocument()
    expect(screen.getByText("by John Doe")).toBeInTheDocument()
    expect(screen.getByText("$2.99")).toBeInTheDocument()
    expect(screen.getByText("4.5")).toBeInTheDocument()
  })

  it("calls onSelect when button is clicked", () => {
    const mockOnSelect = jest.fn()
    render(<ContentCard content={mockContent} onSelect={mockOnSelect} />)
    
    fireEvent.click(screen.getByText("Select for Printing"))
    expect(mockOnSelect).toHaveBeenCalledWith("1")
  })
})
```

---

## Implementation Timeline

### Phase 1: Foundation (6 weeks)
**Week 1-2: Project Setup & Database**
- Next.js 15 project initialization with TypeScript and shadcn/ui
- MongoDB Atlas setup with core schemas
- Basic authentication with NextAuth.js v5

**Week 3-4: File Storage & Email**
- Cloudflare R2 integration with presigned URLs
- SMTP2GO email system setup
- File upload validation and processing

**Week 5-6: Landing Page & User Management**
- Responsive marketplace landing page
- Multi-role user profiles and management
- Admin authentication and basic oversight

### Phase 2: Core Marketplace (7 weeks)
**Week 7-9: Print Shop System**
- Print shop directory and onboarding
- Shop verification and approval workflow
- Basic capacity management

**Week 10-12: Content Management**
- Creator upload system with metadata
- Content discovery and search functionality
- Content moderation and approval

**Week 13: Order Management**
- Order creation and assignment system
- Real-time status tracking and communication
- Basic quality assurance framework

### Phase 3: Payments & Operations (7 weeks)
**Week 14-16: Payment System**
- Stripe Connect marketplace integration
- Revenue splitting and automated payouts
- Payment security and compliance

**Week 17-19: Advanced Features**
- Comprehensive analytics dashboards
- Advanced quality assurance and dispute resolution
- Platform administration tools

**Week 20: Launch Preparation**
- Performance optimization and monitoring
- Security audits and compliance checks
- Production deployment and testing

---

## Conclusion

This comprehensive full-stack architecture provides a robust, scalable foundation for the three-sided printing marketplace with:

🏗️ **Modern Development Stack**
- Next.js 15 with App Router for optimal performance and developer experience
- TypeScript throughout for type safety and maintainability
- MongoDB Atlas for flexible document modeling and global scaling

🎨 **Consistent Design System**
- shadcn/ui foundation with custom marketplace components
- Mobile-first responsive design optimized for student demographic
- Role-specific interfaces with consistent interaction patterns

💳 **Sophisticated Payment Architecture**
- Stripe Connect for marketplace revenue splitting (15-20% platform commission)
- Automated payouts and comprehensive transaction tracking
- PCI compliance and security best practices

📱 **Exceptional User Experience**
- Touch-optimized components with 44px minimum touch targets
- Progressive disclosure for complex workflows
- WCAG AA accessibility compliance

🚀 **Enterprise-Grade Infrastructure**
- Serverless architecture with automatic scaling via Vercel
- Cloudflare R2 for global CDN and cost-effective file storage
- Comprehensive monitoring and health checks

🔒 **Security & Compliance**
- Role-based access control with granular permissions
- Input validation with Zod schemas and rate limiting
- Comprehensive audit logging and GDPR compliance

The architecture supports the ambitious business goals of achieving $1M ARR within 18 months while maintaining sub-3 second load times and 99%+ uptime for 10,000+ users across three distinct marketplace participants: students/businesses, content creators, and print shops.

This foundation enables same-day local printing fulfillment as a key differentiator over online printing services while providing content creators with monetization opportunities through print-on-demand revenue sharing, ultimately establishing market leadership in the educational printing sector.