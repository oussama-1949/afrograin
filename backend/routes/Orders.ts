import { Router } from 'express'
import { z } from 'zod'
import {
  placeOrder,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getAllOrders,
  updateOrderStatus,
} from '../controllers/OrderController'
import { protect } from '../middlewares/Authmiddelware'
import { adminOnly } from '../middlewares/Adminmiddelware'
import { validate } from '../middlewares/ValidateRequest'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────
const shippingAddressSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  phone: z
    .string()
    .regex(/^(\+212|0)[5-7]\d{8}$/, 'Invalid Moroccan phone number'),
  city: z.string().min(2, 'City is required'),
  address: z.string().min(5, 'Address is required'),
  notes: z.string().optional(),
})

const placeOrderSchema = z.object({
  shippingAddress: shippingAddressSchema,
})

const updateStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']),
  cancelReason: z.string().optional(),
})

const cancelOrderSchema = z.object({
  reason: z.string().optional(),
})

// ─── Customer Routes (protected) ──────────────────────────────────────────────
router.post('/', protect, validate(placeOrderSchema), placeOrder)
router.get('/my', protect, getMyOrders)
router.get('/my/:id', protect, getMyOrderById)
router.post('/my/:id/cancel', protect, validate(cancelOrderSchema), cancelMyOrder)

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.get('/', protect, adminOnly, getAllOrders)
router.put('/:id/status', protect, adminOnly, validate(updateStatusSchema), updateOrderStatus)

export default router