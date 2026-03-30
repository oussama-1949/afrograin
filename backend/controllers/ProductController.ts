import { Request, Response, NextFunction } from 'express'
import Product from '../models/Product'
import { ApiError } from '../utils/ApiError'
import { sendSuccess } from '../utils/ApiResponse'
import { AuthRequest } from '../types'
import { getPaginationOptions, buildPaginationResult } from '../utils/Pagination'
import { SortOrder } from 'mongoose'


// ─── GET /api/products ────────────────────────────────────────────────────────
export const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationOptions(req)

    // ─── Filters ──────────────────────────────────────────────────────────────
    const filter: Record<string, unknown> = { isActive: true }

    if (req.query.category) filter.category = req.query.category
    if (req.query.featured === 'true') filter.isFeatured = true

    // ─── Search by name ────────────────────────────────────────────────────────
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string }
    }

    // ─── Price range ───────────────────────────────────────────────────────────
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {
        ...(req.query.minPrice && { $gte: Number(req.query.minPrice) }),
        ...(req.query.maxPrice && { $lte: Number(req.query.maxPrice) }),
      }
    }

    // ─── Sort ──────────────────────────────────────────────────────────────────
   const sortMap: Record<string, { [key: string]: SortOrder }> = {
  newest:     { createdAt: -1 },
  oldest:     { createdAt: 1 },
  price_asc:  { price: 1 },
  price_desc: { price: -1 },
}

// TS now knows this is valid
const sort = sortMap[req.query.sort as string] || { createdAt: -1 }

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .sort(sort)
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ])

    sendSuccess(res, 'Products fetched', {
      products,
      pagination: buildPaginationResult(total, page, limit),
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/products/:slug ──────────────────────────────────────────────────
export const getProductBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug,
      isActive: true,
    }).populate('category', 'name slug')

    if (!product) throw ApiError.notFound('Product not found')
    sendSuccess(res, 'Product fetched', { product })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/products (admin) ───────────────────────────────────────────────
export const createProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name, description, price, comparePrice,
      images, category, stock, unit, isFeatured,
    } = req.body

    const product = await Product.create({
      name, description, price, comparePrice,
      images, category, stock, unit, isFeatured,
    })

    await product.populate('category', 'name slug')

    sendSuccess(res, 'Product created', { product }, 201)
  } catch (err) {
    next(err)
  }
}

// ─── PUT /api/products/:id (admin) ────────────────────────────────────────────
export const updateProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category', 'name slug')

    if (!product) throw ApiError.notFound('Product not found')
    sendSuccess(res, 'Product updated', { product })
  } catch (err) {
    next(err)
  }
}

// ─── DELETE /api/products/:id (admin) ─────────────────────────────────────────
export const deleteProduct = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    if (!product) throw ApiError.notFound('Product not found')
    sendSuccess(res, 'Product deleted')
  } catch (err) {
    next(err)
  }
}