import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger } from '@/lib/security/auditLogger';
import { createSupabaseMiddlewareClient } from '@/lib/supabaseMiddleware';

interface RequestMetadata {
  ip: string;
  userAgent: string;
  url: string;
  method: string;
}

async function logAndRedirect(req: NextRequest, res: NextResponse, requestMetadata: RequestMetadata, reason: string, userError?: { message?: string }) {
  await AuditLogger.logSecurityEvent({
    event_type: 'permission_denied',
    ip_address: requestMetadata.ip,
    user_agent: requestMetadata.userAgent,
    details: {
      attempted_url: requestMetadata.url,
      reason,
      error: userError?.message,
    },
    severity: 'warning',
  });
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = '/login';
  redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

async function logAndRedirectDenied(req: NextRequest, res: NextResponse, requestMetadata: RequestMetadata, user: any, profile: any, profileQueryError?: { message?: string }) {
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
      error: profileQueryError?.message,
    },
    severity: 'error',
  });
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = '/access-denied';
  return NextResponse.redirect(redirectUrl);
}

export async function protectAdminRoutes(req: NextRequest, res: NextResponse, requestMetadata: RequestMetadata) {
  const supabase = createSupabaseMiddlewareClient(req, res);
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return logAndRedirect(req, res, requestMetadata, 'no_session', userError ?? undefined);
  }
  const { data: profile, error: profileQueryError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (profileQueryError || profile?.role !== 'admin') {
    return logAndRedirectDenied(req, res, requestMetadata, user, profile, profileQueryError ?? undefined);
  }
  if (req.method !== 'GET' || req.nextUrl.pathname.includes('/api/')) {
    await AuditLogger.logDataAccess(
      user.id,
      user.email ?? 'unknown',
      'admin_panel',
      req.nextUrl.pathname,
      req.method === 'GET' ? 'read' : 'admin_access',
      {
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
      },
    );
  }
  return res;
}
