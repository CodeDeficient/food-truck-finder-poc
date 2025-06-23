import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RateLimiter, getClientIdentifier } from '@/lib/security/rateLimiter';
import { AuditLogger } from '@/lib/security/auditLogger';
import { handleSuccessfulAuth, handleAuthFailure } from '@/lib/auth/authHelpers';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        return await handleSuccessfulAuth(user, redirectTo, origin, identifier, requestMetadata);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login`);
}
