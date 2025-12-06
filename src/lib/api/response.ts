import { NextResponse } from 'next/server';

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export function success<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return success(data, 201);
}

export function noContent(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

export function error(
  code: string,
  message: string,
  status = 400,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: { code, message, details },
    },
    { status }
  );
}

export function badRequest(message: string, details?: unknown): NextResponse<ApiErrorResponse> {
  return error('BAD_REQUEST', message, 400, details);
}

export function unauthorized(message = 'Unauthorized'): NextResponse<ApiErrorResponse> {
  return error('UNAUTHORIZED', message, 401);
}

export function forbidden(message = 'Forbidden'): NextResponse<ApiErrorResponse> {
  return error('FORBIDDEN', message, 403);
}

export function notFound(resource = 'Resource'): NextResponse<ApiErrorResponse> {
  return error('NOT_FOUND', `${resource} not found`, 404);
}

export function conflict(message: string): NextResponse<ApiErrorResponse> {
  return error('CONFLICT', message, 409);
}

export function serverError(message = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return error('INTERNAL_ERROR', message, 500);
}
