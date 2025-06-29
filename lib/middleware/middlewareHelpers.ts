import { NextRequest, NextResponse } from 'next/server';
import { AuditLogger, SecurityEvent } from '@/lib/security/auditLogger';
import { createSupabaseMiddlewareClient } from '@/lib/supabaseMiddleware';

interface RequestMetadata {
  ip: string;
  userAgent: string;
  url: string;
  method: string;
}

interface SupabaseUser {
  id: string;
  email?: string;
}

interface SupabaseProfile {
  role?: string;
}

interface LogAndRedirectParams {
  req: NextRequest;
  res: NextResponse;
  requestMetadata: RequestMetadata;
  reason: string;
  userError?: { message?: string };
}

interface LogSecurityEventParams {
  event_type: SecurityEvent['event_type'];
  ip_address: string;
  user_agent: string;
  details: Record<string, any>;
  severity: SecurityEvent['severity'];
  user_id?: string;
  user_email?: string;
}

async function logSecurityEventAndRedirect(
  req: NextRequest,
  res: NextResponse,
  logParams: LogSecurityEventParams,
  redirectPath: string,
  redirectFromPath?: string
) {
  await AuditLogger.logSecurityEvent(logParams);
  const redirectUrl = req.nextUrl.clone();
  redirectUrl.pathname = redirectPath;
  if (redirectFromPath) {
    redirectUrl.searchParams.set(`redirectedFrom`, redirectFromPath);
  }
  return NextResponse.redirect(redirectUrl);
}

async function logAndRedirect({ req, res, requestMetadata, reason, userError }: LogAndRedirectParams) {
  return logSecurityEventAndRedirect(
    req,
    res,
    {
      event_type: 'permission_denied',
      ip_address: requestMetadata.ip,
      user_agent: requestMetadata.userAgent,
      details: {
        attempted_url: requestMetadata.url,
        reason,
        error: userError?.message,
      },
      severity: 'warning',
    },
    '/login',
    req.nextUrl.pathname
  );
}

interface LogAndRedirectDeniedParams {
  req: NextRequest;
  res: NextResponse;
  requestMetadata: RequestMetadata;
  user: SupabaseUser;
  profile: SupabaseProfile | null;
  profileQueryError?: { message?: string } | null; // Changed to allow null
}

async function logAndRedirectDenied({ req, res, requestMetadata, user, profile, profileQueryError }: LogAndRedirectDeniedParams) {
  return logSecurityEventAndRedirect(
    req,
    res,
    {
      event_type: 'permission_denied',
      user_id: user.id,
      user_email: user.email ?? undefined,
      ip_address: requestMetadata.ip,
      user_agent: requestMetadata.userAgent,
      details: {
        attempted_url: requestMetadata.url,
        user_role: profile?.role ?? 'none',
        reason: 'insufficient_privileges',
        error: profileQueryError?.message,
      },
      severity: 'error',
    },
    '/access-denied'
  );
}

export async function protectAdminRoutes(req: NextRequest, res: NextResponse, requestMetadata: RequestMetadata) {
  const supabase = createSupabaseMiddlewareClient(req, res);
  const { data, error: userError } = await supabase.auth.getUser();
  const user = data?.user;

  if (userError || !user) {
    return logAndRedirect({ req, res, requestMetadata, reason: 'no_session', userError: userError ?? undefined });
  }
  // Explicitly type the result of the Supabase query
  const { data: profile, error: profileQueryError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single() as { data: SupabaseProfile | null; error: { message?: string } | null };
  if (profileQueryError || (profile && profile.role !== 'admin')) {
    return logAndRedirectDenied({ req, res, requestMetadata, user, profile: profile ?? null, profileQueryError: profileQueryError ?? undefined });
  }
  if (req.method !== 'GET' || req.nextUrl.pathname.includes('/api/')) {
    await AuditLogger.logDataAccess({
      userId: user.id,
      userEmail: user.email ?? 'unknown',
      resourceType: 'admin_panel',
      resourceId: req.nextUrl.pathname,
      action: req.method === 'GET' ? 'read' : 'admin_access',
      request: {
        ip: requestMetadata.ip,
        userAgent: requestMetadata.userAgent,
      },
    });
  }
  return res;
}
