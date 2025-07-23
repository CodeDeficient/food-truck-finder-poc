import { NextResponse } from 'next/server';
import { protectAdminRoutes } from '@/lib/middleware/middlewareHelpers';
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
 */
export async function middleware(req) {
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
    return res;
}
export const config = {
    matcher: ['/admin/:path*'],
};
