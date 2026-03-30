import { Router } from 'express'
import { z } from 'zod'
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/ProductController'
import { uploadImages, deleteImage } from '../controllers/UploadController'
import { protect } from '../middlewares/Authmiddelware'
import { adminOnly } from '../middlewares/Adminmiddelware'
import { validate } from '../middlewares/ValidateRequest'
import { upload } from '../middlewares/Upload'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────
const createProductSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  images: z.array(z.string().url()).default([]),
  category: z.string().min(1, 'Category is required'),
  stock: z.number().int().min(0),
  unit: z.string().default('kg'),
  isFeatured: z.boolean().default(false),
})

const updateProductSchema = createProductSchema.partial()

// ─── Image Upload ─────────────────────────────────────────────────────────────
router.post('/upload', protect, adminOnly, upload.array('images', 5), uploadImages)
router.delete('/upload', protect, adminOnly, deleteImage)

// ─── Public Routes ────────────────────────────────────────────────────────────
router.get('/', getProducts)
router.get('/:slug', getProductBySlug)

// ─── Admin Routes ─────────────────────────────────────────────────────────────
router.post('/', protect, adminOnly, validate(createProductSchema), createProduct)
router.put('/:id', protect, adminOnly, validate(updateProductSchema), updateProduct)
router.delete('/:id', protect, adminOnly, deleteProduct)



export default router