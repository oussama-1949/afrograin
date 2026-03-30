import { Router } from 'express'
import { z } from 'zod'
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from '../controllers/CartContoller'
import { protect } from '../middlewares/Authmiddelware'
import { validate } from '../middlewares/ValidateRequest'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────
const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
})

const updateCartSchema = z.object({
  quantity: z.number().int().min(1, 'Quantity must be at least 1'),
})

// ─── All cart routes require authentication ───────────────────────────────────
router.use(protect)

router.get('/', getCart)
router.post('/', validate(addToCartSchema), addToCart)
router.put('/:productId', validate(updateCartSchema), updateCartItem)
router.delete('/:productId', removeFromCart)
router.delete('/', clearCart)

export default router