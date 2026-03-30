import { Request, Response, NextFunction } from 'express'
import User from '../models/User'
import { generateToken } from '../utils/Generatetoken'
import { sendSuccess } from '../utils/ApiResponse'
import { ApiError } from '../utils/ApiError'
import { AuthRequest } from '../types'

// ─── POST /api/auth/register ──────────────────────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, phone } = req.body

    const existing = await User.findOne({ email })
    if (existing) throw ApiError.conflict('Email already registered')

    const user = await User.create({ name, email, password, phone })

    const token = generateToken({ id: user._id.toString(), role: user.role })

    sendSuccess(res, 'Account created successfully', { user }, 201, token)
  } catch (err) {
    next(err)
  }
}

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body

    // Explicitly select password (it's excluded by default)
    const user = await User.findOne({ email }).select('+password')
    if (!user) throw ApiError.unauthorized('Invalid email or password')

    if (!user.isActive) throw ApiError.forbidden('Account is deactivated')

    const isMatch = await user.comparePassword(password)
    if (!isMatch) throw ApiError.unauthorized('Invalid email or password')

    const token = generateToken({ id: user._id.toString(), role: user.role })

    // Strip password before sending
    const userObj = user.toJSON()

    sendSuccess(res, 'Login successful', { user: userObj }, 200, token)
  } catch (err) {
    next(err)
  }
}

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
export const getMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id)
    if (!user) throw ApiError.notFound('User not found')

    sendSuccess(res, 'Profile fetched', { user })
  } catch (err) {
    next(err)
  }
}

// ─── PUT /api/auth/me ─────────────────────────────────────────────────────────
export const updateMe = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Never allow role or password update through this route
    const { name, phone } = req.body

    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { name, phone },
      { new: true, runValidators: true }
    )

    if (!user) throw ApiError.notFound('User not found')

    sendSuccess(res, 'Profile updated', { user })
  } catch (err) {
    next(err)
  }
}

// ─── PUT /api/auth/change-password ───────────────────────────────────────────
export const changePassword = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body

    const user = await User.findById(req.user?.id).select('+password')
    if (!user) throw ApiError.notFound('User not found')

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) throw ApiError.badRequest('Current password is incorrect')

    user.password = newPassword
    await user.save()

    sendSuccess(res, 'Password changed successfully')
  } catch (err) {
    next(err)
  }
}