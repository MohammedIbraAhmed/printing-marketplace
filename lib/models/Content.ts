import mongoose, { Schema, Model } from 'mongoose'
import { Content } from '@/types'

const MetadataSchema = new Schema(
  {
    subject: { type: String, required: true },
    gradeLevel: [{ type: String, required: true }],
    curriculum: [{ type: String }],
    tags: [{ type: String }],
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
    pageCount: { type: Number },
  },
  { _id: false }
)

const FileSchema = new Schema(
  {
    url: { type: String, required: true },
    cdnUrl: { type: String, required: true },
    key: { type: String, required: true },
    previewUrl: { type: String },
  },
  { _id: false }
)

const PricingSchema = new Schema(
  {
    basePrice: { type: Number, required: true, min: 0 },
    markup: {
      color: { type: Number, required: true, min: 0 },
      binding: { type: Number, required: true, min: 0 },
    },
  },
  { _id: false }
)

const StatsSchema = new Schema(
  {
    views: { type: Number, default: 0, min: 0 },
    orders: { type: Number, default: 0, min: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
)

const ContentSchema = new Schema<Content>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    metadata: {
      type: MetadataSchema,
      required: true,
    },
    file: {
      type: FileSchema,
      required: true,
    },
    pricing: {
      type: PricingSchema,
      required: true,
    },
    stats: {
      type: StatsSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'approved', 'rejected'],
      required: true,
      default: 'draft',
    },
    moderationNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
ContentSchema.index({ creatorId: 1 })
ContentSchema.index({ 'metadata.subject': 1, 'metadata.gradeLevel': 1 })
ContentSchema.index({ status: 1, createdAt: -1 })
ContentSchema.index(
  {
    title: 'text',
    description: 'text',
    'metadata.tags': 'text',
  },
  {
    weights: {
      title: 10,
      description: 5,
      'metadata.tags': 1,
    },
  }
)

export default (mongoose.models.Content as Model<Content>) ||
  mongoose.model<Content>('Content', ContentSchema)
