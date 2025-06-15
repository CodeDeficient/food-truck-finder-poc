// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextResponse } from 'next/server';
// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import type { NextRequest } from 'next/server';
import { createSupabaseMiddlewareClient } from '@/lib/supabaseMiddleware';
import { AuditLogger } from '@/lib/security/auditLogger';

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);

  // Extract request metadata for security logging
  const requestMetadata = {
    ip: req.ip || req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') ?? 'unknown',
    userAgent: req.headers.get('user-agent') ?? 'unknown',
    url: req.nextUrl.pathname,
    method: req.method
  };

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  // Protect admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (userError || !user) {
      // Log unauthorized access attempt
      await AuditLogger.logSecurityEvent({
        event_type: 'permission_denied',
        ip_address: requestMetadata.ip,
        user_agent: requestMetadata.userAgent,
        details: {
          attempted_url: requestMetadata.url,
          reason: 'no_session',
          error: userError?.message
        },
        severity: 'warning'
      });

      // Redirect unauthenticated users to login
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/login';
      redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Check for admin role (assuming 'profiles' table with 'role' column)
    const { data: profile, error: profileQueryError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileQueryError || profile?.role !== 'admin') {
      // Log unauthorized admin access attempt
      await AuditLogger.logSecurityEvent({
        event_type: 'permission_denied',
        user_id: user.id,
        user_email: user.email,
        ip_address: requestMetadata.ip,
        user_agent: requestMetadata.userAgent,
        details: {
          attempted_url: requestMetadata.url,
          user_role: profile?.role ?? 'none',
          reason: 'insufficient_privileges',
          error: profileQueryError?.message
        },
        severity: 'error'
      });

      // Redirect non-admin users to access denied page
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = '/access-denied';
      return NextResponse.redirect(redirectUrl);
    }

    // Log successful admin access for audit trail
    if (req.method !== 'GET' || req.nextUrl.pathname.includes('/api/')) {
      await AuditLogger.logDataAccess(
        user.id,
        user.email ?? 'unknown',
        'admin_panel',
        req.nextUrl.pathname,
        req.method === 'GET' ? 'read' : 'read',
        {
          ip: requestMetadata.ip,
          userAgent: requestMetadata.userAgent
        }
      );
    }
  }

  return res;
}

export const config = {
  matcher: ['/admin/:path*'],
};
