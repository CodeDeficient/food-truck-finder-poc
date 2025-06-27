import { NextRequest, NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { AuditLogger } from '@/lib/security/auditLogger';
import { createSupabaseMiddlewareClient } from '@/lib/supabaseMiddleware';

interface RequestMetadata {
  ip: string;
  userAgent: string;
  url: string;
  method: string;
}

interface ErrorContext {
  message?: string;
}

async function logAndRedirect(
  req: NextRequest,
  res: NextResponse,
  requestMetadata: RequestMetadata,
  reason: string,
  errorContext?: ErrorContext
) {
  await AuditLogger.logSecurityEvent({
    event_type: 'permission_denied',
    ip_address: requestMetadata.ip,
    user_agent: requestMetadata.userAgent,
    details: {
      attempted_url: requestMetadata.url,
      reason,
      error: errorContext?.message,
    },
    severity: 'warning',
  });
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = '/login';
  redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

interface Profile {
  role: string;
}

async function logAndRedirectDenied(
  req: NextRequest,
  res: NextResponse,
  requestMetadata: RequestMetadata,
  authContext: {
    user: User;
    profile: Profile | null;
    profileQueryError?: { message?: string };
  }
) {
  await AuditLogger.logSecurityEvent({
    event_type: 'permission_denied',
    user_id: authContext.user.id,
    user_email: authContext.user.email ?? 'unknown', // Handle possible null email
    ip_address: requestMetadata.ip,
    user_agent: requestMetadata.userAgent,
    details: {
      attempted_url: requestMetadata.url,
      user_role: authContext.profile?.role ?? 'none',
      reason: 'insufficient_privileges',
      error: authContext.profileQueryError?.message,
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
  const { data: profileData, error: profileQueryError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  // Explicitly cast profileData to Profile type or null
  const profile: Profile | null = profileData as Profile | null;

  if (profileQueryError || profile?.role !== 'admin') {
    return logAndRedirectDenied(req, res, requestMetadata, { user, profile, profileQueryError: profileQueryError ?? undefined });
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
