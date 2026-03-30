import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'
import { env } from '../config/env'

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Known operational error
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    })
    return
  }

  // Mongoose duplicate key (e.g. unique email)
  if ((err as any).code === 11000) {
    const field = Object.keys((err as any).keyValue || {})[0]
    res.status(409).json({
      success: false,
      message: `${field} already exists`,
    })
    return
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values((err as any).errors).map(
      (e: any) => e.message
    )
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    })
    return
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' })
    return
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expired' })
    return
  }

  // Unknown error — hide details in production
  console.error('💥 Unhandled error:', err)
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}