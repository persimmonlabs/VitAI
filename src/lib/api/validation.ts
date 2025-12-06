import { z, type ZodSchema } from 'zod';
import { badRequest } from './response';
import type { NextResponse } from 'next/server';
import type { ApiErrorResponse } from './response';

export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse<ApiErrorResponse> }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      const details = result.error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      return {
        success: false,
        response: badRequest('Validation failed', details),
      };
    }

    return { success: true, data: result.data };
  } catch {
    return {
      success: false,
      response: badRequest('Invalid JSON body'),
    };
  }
}

export function validateParams<T>(
  params: unknown,
  schema: ZodSchema<T>
): { success: true; data: T } | { success: false; response: NextResponse<ApiErrorResponse> } {
  const result = schema.safeParse(params);

  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return {
      success: false,
      response: badRequest('Invalid parameters', details),
    };
  }

  return { success: true, data: result.data };
}

export function validateQuery(
  url: URL,
  schema: ZodSchema
): { success: true; data: Record<string, string> } | { success: false; response: NextResponse<ApiErrorResponse> } {
  const query: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    query[key] = value;
  });

  const result = schema.safeParse(query);

  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }));

    return {
      success: false,
      response: badRequest('Invalid query parameters', details),
    };
  }

  return { success: true, data: result.data as Record<string, string> };
}

// Common validation schemas
export const uuidSchema = z.string().uuid();
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const positiveIntSchema = z.coerce.number().int().positive();
