import { Response, NextFunction } from 'express'
import { cloudinary } from '../config/cloudinary'
import { ApiError } from '../utils/ApiError'
import { sendSuccess } from '../utils/ApiResponse'
import { AuthRequest } from '../types'

// ─── POST /api/upload  (admin only) ───────────────────────────────────────────
export const uploadImages = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[]

    if (!files || files.length === 0) {
      throw ApiError.badRequest('No files uploaded')
    }

    const uploadPromises = files.map((file) => {
      return new Promise<string>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: 'afrograin/products',
            transformation: [
              { width: 800, height: 800, crop: 'limit' },
              { quality: 'auto', fetch_format: 'auto' },
            ],
          },
          (error, result) => {
            if (error || !result) return reject(error)
            resolve(result.secure_url)
          }
        )
        stream.end(file.buffer)
      })
    })

    const urls = await Promise.all(uploadPromises)

    sendSuccess(res, 'Images uploaded successfully', { urls }, 201)
  } catch (err) {
    next(err)
  }
}

// ─── DELETE /api/upload  (admin only) ─────────────────────────────────────────
export const deleteImage = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { publicId } = req.body

    if (!publicId) throw ApiError.badRequest('publicId is required')

    await cloudinary.uploader.destroy(publicId)

    sendSuccess(res, 'Image deleted successfully')
  } catch (err) {
    next(err)
  }
}