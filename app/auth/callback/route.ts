import { type NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RateLimiter, getClientIdentifier } from '@/lib/security/rateLimiter';
import { AuditLogger } from '@/lib/security/auditLogger';
import type { User } from '@supabase/supabase-js';

interface RequestMetadata {
  ip: string;
  userAgent: string;
}

async function handleSuccessfulAuth({
  user,
  redirectTo,
  origin,
  identifier,
  requestMetadata,
}: {
  user: User;
  redirectTo: string;
  origin: string;
  identifier: string;
  requestMetadata: RequestMetadata;
}) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  await AuditLogger.logAuthEvent({
    eventType: 'login_success',
    userEmail: user.email,
    userId: user.id,
    request: requestMetadata,
    details: { provider: 'google', role: profile?.role },
  });

  RateLimiter.recordSuccess(identifier, 'auth');

  // Role-based redirects
  switch (profile?.role) {
    case 'admin':
      return NextResponse.redirect(`${origin}${redirectTo.startsWith('/admin') ? redirectTo : '/admin'}`);
    case 'food_truck_owner':
      return NextResponse.redirect(`${origin}/owner-dashboard`);
    case 'customer':
      return NextResponse.redirect(`${origin}/user-dashboard`);
    default:
      await AuditLogger.logSecurityEvent({
        event_type: 'permission_denied',
        user_id: user.id,
        user_email: user.email,
        ip_address: requestMetadata.ip,
        user_agent: requestMetadata.userAgent,
        details: {
          reason: 'insufficient_role',
          user_role: profile?.role ?? 'none',
        },
        severity: 'warning',
      });
      return NextResponse.redirect(`${origin}/access-denied`);
  }
}

async function handleAuthFailure(
  error: Error,
  identifier: string,
  requestMetadata: RequestMetadata,
) {
  await AuditLogger.logAuthEvent({
    eventType: 'login_failure',
    userEmail: undefined,
    userId: undefined,
    request: requestMetadata,
    details: { provider: 'google', error: error.message },
  });
}

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimitResult = RateLimiter.checkRateLimit(identifier, 'auth');

  if (!rateLimitResult.allowed) {
    await AuditLogger.logSecurityEvent({
      event_type: 'login_failure',
      ip_address: identifier.split(':')[0],
      user_agent: request.headers.get('user-agent') ?? 'unknown',
      details: {
        reason: 'rate_limit_exceeded',
        retryAfter: rateLimitResult.retryAfter,
      },
      severity: 'warning',
    });
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=rate_limit`);
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo') ?? '/admin';

  const requestMetadata = {
    ip: identifier.split(':')[0],
    userAgent: request.headers.get('user-agent') ?? 'unknown',
  };

  if (code !== null && code.length > 0) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      await handleAuthFailure(error, identifier, requestMetadata);
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        return await handleSuccessfulAuth({
          user,
          redirectTo,
          origin,
          identifier,
          requestMetadata,
        });
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
