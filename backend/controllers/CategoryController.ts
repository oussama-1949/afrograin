import { Request, Response, NextFunction } from 'express'
import Category from '../models/Category'
import { ApiError } from '../utils/ApiError'
import { sendSuccess } from '../utils/ApiResponse'
import { AuthRequest } from '../types'

// ─── GET /api/categories ──────────────────────────────────────────────────────
export const getCategories = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort({ name: 1 })
    sendSuccess(res, 'Categories fetched', { categories })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/categories/:slug ────────────────────────────────────────────────
export const getCategoryBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true })
    if (!category) throw ApiError.notFound('Category not found')
    sendSuccess(res, 'Category fetched', { category })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/categories (admin) ────────────────────────────────────────────
export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, image } = req.body
    const category = await Category.create({ name, description, image })
    console.log(req.body)
    sendSuccess(res, 'Category created', { category }, 201)
    console.log(req.body, 'after')
  } catch (err) {
    next(err)
  }
}

// ─── PUT /api/categories/:id (admin) ─────────────────────────────────────────
export const updateCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, description, image, isActive } = req.body

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { name, description, image, isActive },
      { new: true, runValidators: true }
    )

    if (!category) throw ApiError.notFound('Category not found')
    sendSuccess(res, 'Category updated', { category })
  } catch (err) {
    next(err)
  }
}

// ─── DELETE /api/categories/:id (admin) ──────────────────────────────────────
export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    if (!category) throw ApiError.notFound('Category not found')
    sendSuccess(res, 'Category deleted')
  } catch (err) {
    next(err)
  }
}