import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectAdminRoutes, protectUserRoutes } from '@/lib/middleware/middlewareHelpers';

/**
 * Handles requests and applies specific middleware logic.
 * @example
 * middleware(req)
 * NextResponse object
 * @param {NextRequest} req - The incoming request object containing headers and other request details.
 * @returns {Promise<NextResponse>} Returns a NextResponse object after processing the middleware logic.
 * @description
 *   - Extracts request metadata, including IP, user agent, URL, and method from request headers.
 *   - Applies admin route protection if the request URL pathname starts with '/admin'.
 *   - Applies user route protection for '/profile' and '/favorites' routes.
 */
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const requestMetadata = {
    ip: req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown',
    userAgent: req.headers.get('user-agent') ?? 'unknown',
    url: req.nextUrl.pathname,
    method: req.method,
  };

  if (req.nextUrl.pathname.startsWith('/admin')) {
    return await protectAdminRoutes(req, res, requestMetadata);
  }

  // Protect user routes that require authentication
  if (req.nextUrl.pathname.startsWith('/profile') || req.nextUrl.pathname.startsWith('/favorites')) {
    return await protectUserRoutes(req, res, requestMetadata);
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*', '/favorites/:path*'],
};
