import mongoose, { Schema, Model } from 'mongoose'
import { Order } from '@/types'

const AddressSchema = new Schema(
  {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true, default: 'US' },
  },
  { _id: false }
)

const CustomerSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contactInfo: { type: Schema.Types.Mixed, required: true },
    deliveryAddress: AddressSchema,
  },
  { _id: false }
)

const OrderItemSchema = new Schema(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      ref: 'Content',
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    fileUrl: { type: String, required: true },
    fileName: { type: String, required: true },
    specifications: { type: Schema.Types.Mixed, required: true },
    pricing: { type: Schema.Types.Mixed, required: true },
  },
  { _id: false }
)

const PrintShopSchema = new Schema(
  {
    shopId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    estimatedCompletion: { type: Date, required: true },
    actualCompletion: { type: Date },
  },
  { _id: false }
)

const DeliverySchema = new Schema(
  {
    method: {
      type: String,
      enum: ['pickup', 'delivery'],
      required: true,
    },
    address: AddressSchema,
    instructions: { type: String },
  },
  { _id: false }
)

const StatusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    note: { type: String },
  },
  { _id: false }
)

const PaymentSchema = new Schema(
  {
    stripePaymentIntentId: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'USD' },
    platformFee: { type: Number, required: true, min: 0 },
    creatorFee: { type: Number, required: true, min: 0 },
    shopFee: { type: Number, required: true, min: 0 },
    status: { type: String, required: true },
  },
  { _id: false }
)

const QualitySchema = new Schema(
  {
    customerRating: { type: Number, min: 1, max: 5 },
    customerReview: { type: String },
    issues: [{ type: Schema.Types.Mixed }],
  },
  { _id: false }
)

const OrderSchema = new Schema<Order>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: CustomerSchema,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (items: unknown[]) {
          return items.length > 0
        },
        message: 'Order must have at least one item',
      },
    },
    printShop: {
      type: PrintShopSchema,
      required: true,
    },
    delivery: {
      type: DeliverySchema,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'pending',
        'accepted',
        'in_progress',
        'ready',
        'completed',
        'cancelled',
      ],
      required: true,
      default: 'pending',
    },
    statusHistory: {
      type: [StatusHistorySchema],
      default: function () {
        return [
          {
            status: this.status || 'pending',
            timestamp: new Date(),
          },
        ]
      },
    },
    payment: {
      type: PaymentSchema,
      required: true,
    },
    quality: {
      type: QualitySchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
)

// Indexes
OrderSchema.index({ 'customer.userId': 1, createdAt: -1 })
OrderSchema.index({ 'printShop.shopId': 1, status: 1 })
OrderSchema.index({ orderNumber: 1 }, { unique: true })
OrderSchema.index({ status: 1, createdAt: -1 })

export default (mongoose.models.Order as Model<Order>) ||
  mongoose.model<Order>('Order', OrderSchema)
