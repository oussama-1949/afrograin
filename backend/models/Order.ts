import mongoose, { Schema } from 'mongoose'
import { IOrder } from '../types'
import { OrderItemSchema } from './OrderItem'

const ShippingAddressSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^(\+212|0)[5-7]\d{8}$/, 'Please enter a valid Moroccan phone number'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
)

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: (items: unknown[]) => items.length > 0,
        message: 'Order must have at least one item',
      },
    },
    shippingAddress: {
      type: ShippingAddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      enum: ['cod'],
      default: 'cod',
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    cancelReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
)

// ─── Auto-generate order number before save ────────────────────────────────────
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8)
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    this.orderNumber = `AFG-${timestamp}-${random}`
  }
  next()
})

// ─── Mark as paid when delivered ──────────────────────────────────────────────
OrderSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'delivered') {
    this.isPaid = true
    this.paidAt = new Date()
  }
  next()
})

// ─── Indexes ──────────────────────────────────────────────────────────────────
OrderSchema.index({ user: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ orderNumber: 1 })

OrderSchema.set('toJSON', {
  transform: (_doc, ret) => {
    const obj = ret as unknown as Record<string, unknown>
    delete obj.__v
    return obj
  },
})

export default mongoose.model<IOrder>('Order', OrderSchema)