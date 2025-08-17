import { ObjectId } from 'mongoose'

export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface User {
  _id: ObjectId
  email: string
  name?: string
  image?: string
  role: 'customer' | 'creator' | 'printShop' | 'admin'
  emailVerified?: Date
  profile?: {
    location?: {
      address: string
      city: string
      coordinates: [number, number]
    }
    bio?: string
    specializations?: string[]
    portfolio?: string[]
    businessInfo?: {
      name: string
      description: string
      capabilities: string[]
      equipment: string[]
      hours: Record<string, unknown>
      pricing: Record<string, unknown>
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

export interface Content {
  _id: ObjectId
  title: string
  description: string
  creatorId: ObjectId
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
    url: string
    cdnUrl: string
    key: string
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

export interface Order {
  _id: ObjectId
  orderNumber: string
  customer: {
    userId: ObjectId
    contactInfo: Record<string, unknown>
    deliveryAddress?: Address
  }
  items: Array<{
    contentId?: ObjectId
    creatorId?: ObjectId
    fileUrl: string
    fileName: string
    specifications: Record<string, unknown>
    pricing: Record<string, unknown>
  }>
  printShop: {
    shopId: ObjectId
    estimatedCompletion: Date
    actualCompletion?: Date
  }
  delivery: {
    method: 'pickup' | 'delivery'
    address?: Address
    instructions?: string
  }
  status:
    | 'pending'
    | 'accepted'
    | 'in_progress'
    | 'ready'
    | 'completed'
    | 'cancelled'
  statusHistory: Array<{
    status: string
    timestamp: Date
    note?: string
  }>
  payment: {
    stripePaymentIntentId: string
    amount: number
    currency: string
    platformFee: number
    creatorFee: number
    shopFee: number
    status: string
  }
  quality: {
    customerRating?: number
    customerReview?: string
    issues?: unknown[]
  }
  createdAt: Date
  updatedAt: Date
}
