import { Response, NextFunction } from 'express'
import Order from '../models/Order'
import Cart from '../models/Cart'
import Product from '../models/Product'
import User from '../models/User'
import { ApiError } from '../utils/ApiError'
import { sendSuccess } from '../utils/ApiResponse'
import { sendOrderConfirmation, sendOrderStatusUpdate } from '../utils/SendEmail'
import { logger } from '../utils/Logger'
import { getPaginationOptions, buildPaginationResult } from '../utils/Pagination'
import { AuthRequest, OrderStatus } from '../types'

const SHIPPING_PRICE = 30  // 30 MAD flat rate
const FREE_SHIPPING_THRESHOLD = 300  // free shipping over 300 MAD

// ─── POST /api/orders ─────────────────────────────────────────────────────────
export const placeOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { shippingAddress } = req.body

    // ─── Get user's cart ───────────────────────────────────────────────────────
    const cart = await Cart.findOne({ user: req.user?.id })
    if (!cart || cart.items.length === 0) {
      throw ApiError.badRequest('Your cart is empty')
    }

    // ─── Validate stock for every item ────────────────────────────────────────
    const stockErrors: string[] = []

    for (const item of cart.items) {
      const product = await Product.findById(item.product)
      if (!product || !product.isActive) {
        stockErrors.push(`${item.name} is no longer available`)
        continue
      }
      if (product.stock < item.quantity) {
        stockErrors.push(
          `${item.name}: only ${product.stock} ${product.unit} available`
        )
      }
    }

    if (stockErrors.length > 0) {
      throw ApiError.badRequest('Stock issues found', stockErrors)
    }

    // ─── Build order items + deduct stock ─────────────────────────────────────
    const orderItems = []

    for (const item of cart.items) {
      const product = await Product.findById(item.product)
      if (!product) continue

      orderItems.push({
        product: product._id,
        name:     product.name,
        image:    product.images[0] || '',
        price:    product.price,
        unit:     product.unit,
        quantity: item.quantity,
        subtotal: Math.round(product.price * item.quantity * 100) / 100,
      })

      // Deduct stock immediately
      await Product.findByIdAndUpdate(product._id, {
        $inc: { stock: -item.quantity },
      })
    }

    // ─── Calculate totals ──────────────────────────────────────────────────────
    const totalPrice = Math.round(
      orderItems.reduce((sum, item) => sum + item.subtotal, 0) * 100
    ) / 100

    const shippingPrice = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_PRICE
    const grandTotal = Math.round((totalPrice + shippingPrice) * 100) / 100

    // ─── Create order ──────────────────────────────────────────────────────────
    const order = await Order.create({
      user: req.user?.id,
      items: orderItems,
      shippingAddress,
      totalPrice,
      shippingPrice,
      grandTotal,
      paymentMethod: 'cod',
    })

    // ─── Clear cart after order ────────────────────────────────────────────────
    cart.items = []
    await cart.save()

    // ─── Send confirmation email (non-blocking) ────────────────────────────────
    const user = await User.findById(req.user?.id)
    if (user) {
      sendOrderConfirmation(order, user.email, user.name).catch((err) =>
        logger.error('Order confirmation email failed', err)
      )
    }

    logger.info(`New order placed: ${order.orderNumber}`)
    sendSuccess(res, 'Order placed successfully', { order }, 201)
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/orders/my ───────────────────────────────────────────────────────
export const getMyOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationOptions(req)

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user?.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ user: req.user?.id }),
    ])

    sendSuccess(res, 'Orders fetched', {
      orders,
      pagination: buildPaginationResult(total, page, limit),
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/orders/my/:id ───────────────────────────────────────────────────
export const getMyOrderById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user?.id,
    })
    if (!order) throw ApiError.notFound('Order not found')
    sendSuccess(res, 'Order fetched', { order })
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/orders/my/:id/cancel ──────────────────────────────────────────
export const cancelMyOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user?.id,
    })

    if (!order) throw ApiError.notFound('Order not found')

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw ApiError.badRequest(
        `Cannot cancel an order that is already ${order.status}`
      )
    }

    // ─── Restore stock ─────────────────────────────────────────────────────────
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      })
    }

    order.status = 'cancelled'
    order.cancelReason = req.body.reason || 'Cancelled by customer'
    await order.save()

    sendSuccess(res, 'Order cancelled', { order })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/orders (admin) ──────────────────────────────────────────────────
export const getAllOrders = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationOptions(req)

    const filter: Record<string, unknown> = {}
    if (req.query.status) filter.status = req.query.status

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments(filter),
    ])

    sendSuccess(res, 'All orders fetched', {
      orders,
      pagination: buildPaginationResult(total, page, limit),
    })
  } catch (err) {
    next(err)
  }
}

// ─── PUT /api/orders/:id/status (admin) ───────────────────────────────────────
export const updateOrderStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { status, cancelReason } = req.body

    const validStatuses: OrderStatus[] = [
      'pending', 'confirmed', 'shipped', 'delivered', 'cancelled',
    ]

    if (!validStatuses.includes(status)) {
      throw ApiError.badRequest(`Invalid status: ${status}`)
    }

    const order = await Order.findById(req.params.id).populate(
      'user',
      'name email'
    )
    if (!order) throw ApiError.notFound('Order not found')

    // ─── Restore stock if admin cancels ───────────────────────────────────────
    if (status === 'cancelled' && order.status !== 'cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity },
        })
      }
      order.cancelReason = cancelReason || 'Cancelled by admin'
    }

    order.status = status
    await order.save()

    // ─── Notify customer by email ──────────────────────────────────────────────
    const user = order.user as any
    if (user?.email) {
      sendOrderStatusUpdate(order, user.email, user.name).catch((err) =>
        logger.error('Status update email failed', err)
      )
    }

    logger.info(`Order ${order.orderNumber} status → ${status}`)
    sendSuccess(res, 'Order status updated', { order })
  } catch (err) {
    next(err)
  }
}