import { Request } from 'express'
import { PaginationResult } from '../types'

export interface PaginationOptions {
  page: number
  limit: number
  skip: number
}

export const getPaginationOptions = (req: Request): PaginationOptions => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1)
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 12))
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export const buildPaginationResult = (
  total: number,
  page: number,
  limit: number
): PaginationResult => ({
  total,
  page,
  pages: Math.ceil(total / limit),
  limit,
})