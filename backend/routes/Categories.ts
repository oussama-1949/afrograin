import { Router } from 'express'
import { z } from 'zod'
import {
  getCategories,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/CategoryController'
import { protect } from '../middlewares/Authmiddelware'
import { adminOnly } from '../middlewares/Adminmiddelware'
import { validate } from '../middlewares/ValidateRequest'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────
const createCategorySchema = z.object({
  name: z.string().min(2).max(50),
  description: z.string().max(200).optional(),
  image: z.string().url().optional(),
})

const updateCategorySchema = z.object({
  name: z.string().min(2).max(50).optional(),
  description: z.string().max(200).optional(),
  image: z.string().url().optional(),
  isActive: z.boolean().optional(),
})

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', getCategories)
router.get('/:slug', getCategoryBySlug)

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, validate(createCategorySchema), createCategory)
router.put('/:id', protect, adminOnly, validate(updateCategorySchema), updateCategory)
router.delete('/:id', protect, adminOnly, deleteCategory)

export default router