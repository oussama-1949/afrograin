import { Response } from 'express'
import { ApiResponseData } from '../types'

export const sendSuccess = <T>(
  res: Response,
  message: string,
  data?: T,
  statusCode = 200,
  token?: string
): Response => {
  const body: ApiResponseData<T> = { success: true, message, data, token }
  return res.status(statusCode).json(body)
}

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errors?: string[]
): Response => {
  const body: ApiResponseData = { success: false, message, errors }
  return res.status(statusCode).json(body)
}