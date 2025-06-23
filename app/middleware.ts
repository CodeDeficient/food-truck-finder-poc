import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { protectAdminRoutes } from '@/lib/middleware/middleware-helpers';

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

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
