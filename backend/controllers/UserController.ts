import { Response, NextFunction } from 'express'
import User from '../models/User'
import Order from '../models/Order'
import { ApiError } from '../utils/ApiError'
import { sendSuccess } from '../utils/ApiResponse'
import { AuthRequest } from '../types'
import { getPaginationOptions, buildPaginationResult } from '../utils/Pagination'

// ─── GET /api/users (admin) ───────────────────────────────────────────────────
export const getAllUsers = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { page, limit, skip } = getPaginationOptions(req)

    const filter: Record<string, unknown> = {}
    if (req.query.role)     filter.role = req.query.role
    if (req.query.isActive) filter.isActive = req.query.isActive === 'true'

    // Search by name or email
    if (req.query.search) {
      const regex = new RegExp(req.query.search as string, 'i')
      filter.$or = [{ name: regex }, { email: regex }]
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(filter),
    ])

    sendSuccess(res, 'Users fetched', {
      users,
      pagination: buildPaginationResult(total, page, limit),
    })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/users/:id (admin) ───────────────────────────────────────────────
export const getUserById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) throw ApiError.notFound('User not found')

    // Fetch order stats for this user
    const [totalOrders, totalSpent] = await Promise.all([
      Order.countDocuments({ user: req.params.id }),
      Order.aggregate([
        { $match: { user: user._id, status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
    ])

    sendSuccess(res, 'User fetched', {
      user,
      stats: {
        totalOrders,
        totalSpent: totalSpent[0]?.total || 0,
      },
    })
  } catch (err) {
    next(err)
  }
}

// ─── PUT /api/users/:id/role (admin) ─────────────────────────────────────────
export const updateUserRole = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { role } = req.body

    // Prevent admin from changing their own role
    if (req.params.id === req.user?.id) {
      throw ApiError.badRequest('You cannot change your own role')
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    ).select('-password')

    if (!user) throw ApiError.notFound('User not found')

    sendSuccess(res, `User role updated to ${role}`, { user })
  } catch (err) {
    next(err)
  }
}

// ─── PUT /api/users/:id/status (admin) ───────────────────────────────────────
export const toggleUserStatus = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Prevent admin from deactivating themselves
    if (req.params.id === req.user?.id) {
      throw ApiError.badRequest('You cannot deactivate your own account')
    }

    const user = await User.findById(req.params.id)
    if (!user) throw ApiError.notFound('User not found')

    user.isActive = !user.isActive
    await user.save()

    const action = user.isActive ? 'activated' : 'deactivated'
    sendSuccess(res, `User account ${action}`, { user })
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/users/stats (admin) ────────────────────────────────────────────
export const getDashboardStats = async (
  _req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const [
      totalUsers,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$grandTotal' } } },
      ]),
    ])

    sendSuccess(res, 'Dashboard stats fetched', {
      users: {
        total: totalUsers,
      },
      orders: {
        total:     totalOrders,
        pending:   pendingOrders,
        confirmed: confirmedOrders,
        shipped:   shippedOrders,
        delivered: deliveredOrders,
        cancelled: cancelledOrders,
      },
      revenue: {
        total: revenueResult[0]?.total || 0,
      },
    })
  } catch (err) {
    next(err)
  }
}