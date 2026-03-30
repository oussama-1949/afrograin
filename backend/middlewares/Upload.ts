import multer from 'multer'
import { Request } from 'express'
import { ApiError } from '../utils/ApiError'

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const MAX_SIZE_MB = 5

// ─── Store in memory, then upload to Cloudinary ───────────────────────────────
const storage = multer.memoryStorage()

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new ApiError(`Only ${ALLOWED_TYPES.join(', ')} files are allowed`, 400))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE_MB * 1024 * 1024,
    files: 5, 
  },
})