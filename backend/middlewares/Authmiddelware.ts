import { Response, NextFunction } from 'express'
import { verifyToken } from '../utils/Generatetoken'
import { ApiError } from '../utils/ApiError'
import { AuthRequest } from '../types'

export const protect = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided')
    }

    const token = authHeader.split(' ')[1]
    const decoded = verifyToken(token)

    req.user = { id: decoded.id, role: decoded.role }
    next()
  } catch (err) {
    next(err)
  }
}