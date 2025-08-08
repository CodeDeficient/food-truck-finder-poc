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

  // Smart role-based redirects
  if (redirectTo === '/') {
    // If coming from home page, route based on role
    switch (profile?.role) {
      case 'admin':
        return NextResponse.redirect(`${origin}/admin`);
      case 'food_truck_owner':
        return NextResponse.redirect(`${origin}/owner-dashboard`);
      case 'customer':
      default:
        return NextResponse.redirect(`${origin}/profile`);
    }
  } else if (redirectTo.startsWith('/admin')) {
    // Admin routes require admin role
    if (profile?.role === 'admin') {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    } else {
      // Non-admins go to their appropriate dashboard
      return NextResponse.redirect(`${origin}${profile?.role === 'food_truck_owner' ? '/owner-dashboard' : '/profile'}`);
    }
  } else {
    // For any other specific route, just redirect there
    // The middleware will handle access control
    return NextResponse.redirect(`${origin}${redirectTo}`);
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
  const redirectTo = searchParams.get('redirectTo') ?? '/';

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
