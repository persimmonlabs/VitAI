import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { detectLocaleFromRequest, LOCALE_HEADER_NAME } from '@/i18n';

// Rate limiting store (in-memory, use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests
const RATE_WINDOW = 60 * 1000; // 1 minute

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0]?.trim() : 'unknown';
  return ip ?? 'unknown';
}

function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1 };
  }

  if (record.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT - record.count };
}

// Routes that require authentication
const protectedRoutes = ['/app'];

// Routes that require the user to NOT be authenticated
const authRoutes = ['/login', '/signup', '/forgot-password'];

function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some((route) => pathname.startsWith(route));
}

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes (except auth check)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/static') ||
    pathname.includes('.') // Files with extensions
  ) {
    return NextResponse.next();
  }

  // 1. Rate limiting (for API routes)
  if (pathname.startsWith('/api')) {
    const ip = getClientIP(request);
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: { code: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests' } }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
            'X-RateLimit-Remaining': '0',
          },
        }
      );
    }

    // Continue to auth check for API routes
    const response = await updateSession(request);
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    return response;
  }

  // 2. Locale detection
  const locale = detectLocaleFromRequest(request);

  // 3. Update Supabase session
  const response = await updateSession(request);

  // 4. Set locale header for use in pages
  response.headers.set(LOCALE_HEADER_NAME, locale);

  // 5. Authentication check for protected routes
  if (isProtectedRoute(pathname)) {
    // Check if user is authenticated by looking for Supabase session cookie
    const hasSession = request.cookies.getAll().some(
      (cookie) => cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
    );

    if (!hasSession) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 6. Redirect authenticated users away from auth pages
  if (isAuthRoute(pathname)) {
    const hasSession = request.cookies.getAll().some(
      (cookie) => cookie.name.includes('sb-') && cookie.name.includes('-auth-token')
    );

    if (hasSession) {
      return NextResponse.redirect(new URL('/app', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
