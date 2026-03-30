import { Response, NextFunction } from 'express'
import { ApiError } from '../utils/ApiError'
import { AuthRequest } from '../types'

export const adminOnly = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== 'admin') {
    return next(ApiError.forbidden('Admin access only'))
  }
  next()
}