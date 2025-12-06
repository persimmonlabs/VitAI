import { type ErrorCode, HTTP_STATUS_MAP, ErrorCodes } from './error-codes';

export interface ErrorDetails {
  field?: string;
  value?: unknown;
  reason?: string;
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;
  public readonly details?: ErrorDetails;
  public readonly isOperational: boolean;

  constructor(
    code: ErrorCode,
    message: string,
    details?: ErrorDetails,
    isOperational = true
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = HTTP_STATUS_MAP[code] ?? 500;
    this.details = details;
    this.isOperational = isOperational;

    // Maintains proper stack trace for where error was thrown
    Error.captureStackTrace(this, this.constructor);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }

  // Factory methods for common errors
  static unauthorized(message = 'Unauthorized'): AppError {
    return new AppError(ErrorCodes.UNAUTHORIZED, message);
  }

  static forbidden(message = 'Forbidden'): AppError {
    return new AppError(ErrorCodes.FORBIDDEN, message);
  }

  static notFound(resource = 'Resource'): AppError {
    return new AppError(ErrorCodes.NOT_FOUND, `${resource} not found`);
  }

  static validation(message: string, details?: ErrorDetails): AppError {
    return new AppError(ErrorCodes.VALIDATION_ERROR, message, details);
  }

  static conflict(message: string, details?: ErrorDetails): AppError {
    return new AppError(ErrorCodes.CONFLICT, message, details);
  }

  static rateLimit(message = 'Too many requests'): AppError {
    return new AppError(ErrorCodes.RATE_LIMIT_EXCEEDED, message);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError(ErrorCodes.INTERNAL_ERROR, message, undefined, false);
  }

  static database(message = 'Database error'): AppError {
    return new AppError(ErrorCodes.DATABASE_ERROR, message, undefined, false);
  }

  static aiService(message = 'AI service error'): AppError {
    return new AppError(ErrorCodes.AI_SERVICE_ERROR, message);
  }
}
