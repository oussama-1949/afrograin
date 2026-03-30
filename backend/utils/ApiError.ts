export class ApiError extends Error {
  statusCode: number
  errors?: string[]

  constructor(message: string, statusCode = 500, errors?: string[]) {
    super(message)
    this.statusCode = statusCode
    this.errors = errors
    this.name = 'ApiError'

    // Maintains proper stack trace in V8
    Error.captureStackTrace(this, this.constructor)
  }

  static badRequest(message: string, errors?: string[]): ApiError {
    return new ApiError(message, 400, errors)
  }

  static unauthorized(message = 'Unauthorized'): ApiError {
    return new ApiError(message, 401)
  }

  static forbidden(message = 'Forbidden'): ApiError {
    return new ApiError(message, 403)
  }

  static notFound(message = 'Resource not found'): ApiError {
    return new ApiError(message, 404)
  }

  static conflict(message: string): ApiError {
    return new ApiError(message, 409)
  }

  static internal(message = 'Internal server error'): ApiError {
    return new ApiError(message, 500)
  }
}