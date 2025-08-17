# Database Architecture

## Core Collections Schema

### Users Collection
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

### Content Collection
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

### Orders Collection
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

## Database Indexes
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
