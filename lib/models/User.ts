import mongoose, { Schema, Model } from 'mongoose'
import { User } from '@/types'

// Note: AddressSchema is defined here for consistency with Order model
// but is used in the profile location structure below

const BusinessInfoSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    capabilities: [{ type: String }],
    equipment: [{ type: String }],
    hours: { type: Schema.Types.Mixed },
    pricing: { type: Schema.Types.Mixed },
  },
  { _id: false }
)

const ProfileSchema = new Schema(
  {
    location: {
      address: { type: String },
      city: { type: String },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
    },
    bio: { type: String },
    specializations: [{ type: String }],
    portfolio: [{ type: String }],
    businessInfo: BusinessInfoSchema,
    isVerified: { type: Boolean, default: false },
  },
  { _id: false }
)

const NotificationPreferencesSchema = new Schema(
  {
    email: { type: Boolean, default: true },
    orderUpdates: { type: Boolean, default: true },
    marketing: { type: Boolean, default: false },
  },
  { _id: false }
)

const PrivacySettingsSchema = new Schema(
  {
    profileVisibility: { 
      type: String, 
      enum: ['public', 'business-only', 'private'], 
      default: 'public' 
    },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    allowDataSharing: { type: Boolean, default: false },
    allowMarketingEmails: { type: Boolean, default: false },
    allowAnalytics: { type: Boolean, default: true },
  },
  { _id: false }
)

const ConsentPreferencesSchema = new Schema(
  {
    essential: { type: Boolean, default: true },
    analytics: { type: Boolean, default: false },
    marketing: { type: Boolean, default: false },
    thirdParty: { type: Boolean, default: false },
    communications: { type: Boolean, default: false },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
)

const DataUsageConsentSchema = new Schema(
  {
    profileData: { type: Boolean, default: true },
    activityTracking: { type: Boolean, default: false },
    communicationHistory: { type: Boolean, default: true },
    fileUploads: { type: Boolean, default: true },
    behavioralAnalytics: { type: Boolean, default: false },
    thirdPartySharing: { type: Boolean, default: false },
    marketingAnalytics: { type: Boolean, default: false },
  },
  { _id: false }
)

const PreferencesSchema = new Schema(
  {
    notifications: {
      type: NotificationPreferencesSchema,
      default: () => ({}),
    },
  },
  { _id: false }
)

const UserSchema = new Schema<User>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Don't include password in queries by default
    },
    name: {
      type: String,
      trim: true,
    },
    image: {
      type: String,
    },
    role: {
      type: String,
      enum: ['customer', 'creator', 'printShop', 'admin'],
      required: true,
      default: 'customer',
    },
    emailVerified: {
      type: Date,
    },
    profile: ProfileSchema,
    preferences: {
      type: PreferencesSchema,
      default: () => ({}),
    },
    privacy: {
      type: PrivacySettingsSchema,
      default: () => ({}),
    },
    consent: {
      type: ConsentPreferencesSchema,
      default: () => ({}),
    },
    dataUsageConsent: {
      type: DataUsageConsentSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['active', 'deactivated', 'suspended'],
      default: 'active',
    },
    deactivatedAt: {
      type: Date,
    },
    deactivationReason: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ role: 1 })
UserSchema.index({ 'profile.location.coordinates': '2dsphere' })

export default (mongoose.models.User as Model<User>) ||
  mongoose.model<User>('User', UserSchema)
