import { Request } from 'express'
import { Document, Types } from 'mongoose'

// ─── User ─────────────────────────────────────────────────────────────────────
export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  password: string
  phone?: string
  role: 'user' | 'admin'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface ICategory extends Document {
  _id: Types.ObjectId
  name: string
  slug: string
  description?: string
  image?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface IProduct extends Document {
  _id: Types.ObjectId
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number
  images: string[]
  category: Types.ObjectId
  stock: number
  unit: string
  isActive: boolean
  isFeatured: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface ICartItem {
  product: Types.ObjectId
  name: string
  image: string
  price: number
  unit: string
  quantity: number
}

export interface ICart extends Document {
  _id: Types.ObjectId
  user: Types.ObjectId
  items: ICartItem[]
  totalPrice: number
  totalItems: number
  createdAt: Date
  updatedAt: Date
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

export interface IOrderItem {
  product: Types.ObjectId
  name: string
  image: string
  price: number
  unit: string
  quantity: number
  subtotal: number
}

export interface IShippingAddress {
  fullName: string
  phone: string
  city: string
  address: string
  notes?: string
}

export interface IOrder extends Document {
  _id: Types.ObjectId
  orderNumber: string
  user: Types.ObjectId
  items: IOrderItem[]
  shippingAddress: IShippingAddress
  status: OrderStatus
  paymentMethod: 'cod'
  isPaid: boolean
  paidAt?: Date
  totalPrice: number
  shippingPrice: number
  grandTotal: number
  cancelReason?: string
  createdAt: Date
  updatedAt: Date
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationResult {
  total: number
  page: number
  pages: number
  limit: number
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: PaginationResult
}

// ─── Auth Request (after authMiddleware runs) ─────────────────────────────────
export interface AuthRequest extends Request {
  user?: {
    id: string
    role: 'user' | 'admin'
  }
}

// ─── JWT Payload ──────────────────────────────────────────────────────────────
export interface JwtPayload {
  id: string
  role: 'user' | 'admin'
}

// ─── API Response shape ───────────────────────────────────────────────────────
export interface ApiResponseData<T = unknown> {
  success: boolean
  message: string
  data?: T
  token?: string
  errors?: string[]
}