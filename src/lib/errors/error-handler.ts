import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './AppError';
import { ErrorCodes } from './error-codes';
import { logger } from '../logging/logger';

interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function handleApiError(
  error: unknown,
  context?: { userId?: string; path?: string }
): NextResponse<ApiErrorResponse> {
  // Log the error
  logger.error('API Error', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  });

  // Handle AppError
  if (AppError.isAppError(error)) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode });
  }

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details = error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return NextResponse.json(
      {
        error: {
          code: ErrorCodes.VALIDATION_ERROR,
          message: 'Validation failed',
          details,
        },
      },
      { status: 400 }
    );
  }

  // Handle Supabase errors
  if (isSupabaseError(error)) {
    const { code, message, statusCode } = mapSupabaseError(error);
    return NextResponse.json(
      { error: { code, message } },
      { status: statusCode }
    );
  }

  // Handle unknown errors
  const isProduction = process.env.NODE_ENV === 'production';

  return NextResponse.json(
    {
      error: {
        code: ErrorCodes.INTERNAL_ERROR,
        message: isProduction
          ? 'An unexpected error occurred'
          : error instanceof Error
          ? error.message
          : 'Unknown error',
      },
    },
    { status: 500 }
  );
}

interface ClientError {
  code: string;
  message: string;
  translationKey?: string;
}

export function handleClientError(error: unknown): ClientError {
  if (AppError.isAppError(error)) {
    return {
      code: error.code,
      message: error.message,
      translationKey: `errors.${error.code.toLowerCase()}`,
    };
  }

  if (error instanceof ZodError) {
    const firstError = error.errors[0];
    return {
      code: ErrorCodes.VALIDATION_ERROR,
      message: firstError?.message ?? 'Validation failed',
      translationKey: 'validation.required',
    };
  }

  return {
    code: ErrorCodes.INTERNAL_ERROR,
    message: 'An unexpected error occurred',
    translationKey: 'errors.somethingWentWrong',
  };
}

interface SupabaseError {
  code?: string;
  message?: string;
  details?: string;
}

function isSupabaseError(error: unknown): error is SupabaseError {
  return (
    typeof error === 'object' &&
    error !== null &&
    ('code' in error || 'message' in error)
  );
}

function mapSupabaseError(error: SupabaseError): {
  code: string;
  message: string;
  statusCode: number;
} {
  const supabaseCode = error.code;

  switch (supabaseCode) {
    case '23505': // Unique violation
      return {
        code: ErrorCodes.DUPLICATE_ENTRY,
        message: 'A record with this value already exists',
        statusCode: 409,
      };
    case '23503': // Foreign key violation
      return {
        code: ErrorCodes.NOT_FOUND,
        message: 'Related record not found',
        statusCode: 404,
      };
    case 'PGRST116': // No rows returned
      return {
        code: ErrorCodes.NOT_FOUND,
        message: 'Resource not found',
        statusCode: 404,
      };
    case 'invalid_grant':
    case 'invalid_credentials':
      return {
        code: ErrorCodes.INVALID_CREDENTIALS,
        message: 'Invalid credentials',
        statusCode: 401,
      };
    default:
      return {
        code: ErrorCodes.DATABASE_ERROR,
        message: error.message ?? 'Database error',
        statusCode: 500,
      };
  }
}

export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorInfo = {
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    code: AppError.isAppError(error) ? error.code : undefined,
    isOperational: AppError.isAppError(error) ? error.isOperational : false,
    ...context,
  };

  if (AppError.isAppError(error) && error.isOperational) {
    logger.warn('Operational error', errorInfo);
  } else {
    logger.error('Unexpected error', errorInfo);
  }
}
