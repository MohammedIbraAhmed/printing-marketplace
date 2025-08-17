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
