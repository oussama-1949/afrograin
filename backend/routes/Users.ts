import { Router } from 'express'
import { z } from 'zod'
import {
  getAllUsers,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  getDashboardStats,
} from '../controllers/UserController'
import { protect } from '../middlewares/Authmiddelware'
import { adminOnly } from '../middlewares/Adminmiddelware'
import { validate } from '../middlewares/ValidateRequest'

const router = Router()

// ─── Validation Schemas ───────────────────────────────────────────────────────
const updateRoleSchema = z.object({
  role: z.enum(['user', 'admin'], {
        message: 'Role must be user or admin',

  }),
})

// ─── All routes are admin only ────────────────────────────────────────────────
router.use(protect, adminOnly)

router.get('/stats', getDashboardStats)
router.get('/', getAllUsers)
router.get('/:id', getUserById)
router.put('/:id/role', validate(updateRoleSchema), updateUserRole)
router.put('/:id/status', toggleUserStatus)

export default router