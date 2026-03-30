import { Router } from 'express'
import { z } from 'zod'
import { register, login, getMe, updateMe, changePassword } from '../controllers/authController'
import { protect } from '../middlewares/Authmiddelware'
import { validate } from '../middlewares/ValidateRequest'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(50),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  phone: z
    .string()
    .regex(/^(\+212|0)[5-7]\d{8}$/, 'Invalid Moroccan phone number')
    .optional(),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const updateMeSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  phone: z
    .string()
    .regex(/^(\+212|0)[5-7]\d{8}$/, 'Invalid Moroccan phone number')
    .optional(),
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
})

// ─── Public Routes ────────────────────────────────────────────────────────────
router.post('/register', validate(registerSchema), register)
router.post('/login', validate(loginSchema), login)

// ─── Protected Routes ─────────────────────────────────────────────────────────
router.get('/me', protect, getMe)
router.put('/me', protect, validate(updateMeSchema), updateMe)
router.put('/change-password', protect, validate(changePasswordSchema), changePassword)

export default router