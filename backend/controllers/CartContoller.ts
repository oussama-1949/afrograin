import { Response, NextFunction } from 'express'
import Cart from '../models/Cart'
import Product from '../models/Product'
import { ApiError } from '../utils/ApiError'
import { sendSuccess } from '../utils/ApiResponse'
import { AuthRequest } from '../types'


// ─── GET /api/cart ────────────────────────────────────────────────────────────
export const getCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id })

    // Return empty cart if none exists yet — not an error
    if (!cart) {
      sendSuccess(res, 'Cart is empty', {
        cart: { items: [], totalPrice: 0, totalItems: 0 },
      })
      return
    }

    sendSuccess(res, 'Cart fetched', { cart })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/cart ───────────────────────────────────────────────────────────
export const addToCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body
    

    // ─── Validate product exists and is in stock ───────────────────────────────
    const product = await Product.findOne({ _id: productId, isActive: true })
    if (!product) throw ApiError.notFound('Product not found')
    if (product.stock < quantity) {
      throw ApiError.badRequest(
        `Only ${product.stock} ${product.unit} available in stock`
      )
    }

    let cart = await Cart.findOne({ user: req.user?.id })

    if (!cart) {
      // First time — create a new cart
      cart = await Cart.create({
        user: req.user?.id,
        items: [
          {
            product: product._id,
            name: product.name,
            image: product.images[0] || '',
            price: product.price,
            unit: product.unit,
            quantity,
          },
        ],
      })
    } else {
      // Cart exists — check if product already in cart
      const existingIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId
      )

      if (existingIndex >= 0) {
        // Update quantity
        const newQty = cart.items[existingIndex].quantity + quantity
        if (newQty > product.stock) {
          throw ApiError.badRequest(
            `Cannot add more — only ${product.stock} ${product.unit} available`
          )
        }
        cart.items[existingIndex].quantity = newQty
      } else {
        // Add new item
        cart.items.push({
          product: product._id,
          name: product.name,
          image: product.images[0] || '',
          price: product.price,
          unit: product.unit,
          quantity,
        })
      }

      await cart.save()
    }

    sendSuccess(res, 'Product added to cart', { cart }, 201)
  } catch (err) {
    next(err)
  }
}

// ─── PUT /api/cart/:productId ─────────────────────────────────────────────────
export const updateCartItem = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { quantity } = req.body
    const { productId } = req.params

    if (!quantity || quantity < 1) {
      throw ApiError.badRequest('Quantity must be at least 1')
    }

    const product = await Product.findById(productId)
    if (!product) throw ApiError.notFound('Product not found')
    if (product.stock < quantity) {
      throw ApiError.badRequest(
        `Only ${product.stock} ${product.unit} available in stock`
      )
    }

    const cart = await Cart.findOne({ user: req.user?.id })
    if (!cart) throw ApiError.notFound('Cart not found')

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    )
    if (itemIndex === -1) throw ApiError.notFound('Item not in cart')

    cart.items[itemIndex].quantity = quantity
    await cart.save()

    sendSuccess(res, 'Cart updated', { cart })
  } catch (err) {
    next(err)
  }
}

// ─── DELETE /api/cart/:productId ──────────────────────────────────────────────
export const removeFromCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { productId } = req.params

    const cart = await Cart.findOne({ user: req.user?.id })
    if (!cart) throw ApiError.notFound('Cart not found')

    const itemExists = cart.items.some(
      (item) => item.product.toString() === productId
    )
    if (!itemExists) throw ApiError.notFound('Item not in cart')

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== productId
    )
    await cart.save()

    sendSuccess(res, 'Item removed from cart', { cart })
  } catch (err) {
    next(err)
  }
}

// ─── DELETE /api/cart ─────────────────────────────────────────────────────────
export const clearCart = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cart = await Cart.findOne({ user: req.user?.id })
    if (!cart) throw ApiError.notFound('Cart not found')

    cart.items = []
    await cart.save()

    sendSuccess(res, 'Cart cleared', { cart })
  } catch (err) {
    next(err)
  }
}