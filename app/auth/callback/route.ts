// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
// @ts-expect-error TS(2792): Cannot find module '@/lib/security/rateLimiter'. D... Remove this comment to see the full error message
import { RateLimiter, getClientIdentifier } from '@/lib/security/rateLimiter';
import { AuditLogger } from '@/lib/security/auditLogger';

export async function GET(request: NextRequest) {
  // Apply rate limiting to auth callback
  const identifier = getClientIdentifier(request);
  const rateLimitResult = RateLimiter.checkRateLimit(identifier, 'auth');

  if (!rateLimitResult.allowed) {
    await AuditLogger.logSecurityEvent({
      event_type: 'login_failure',
      ip_address: identifier.split(':')[0],
      user_agent: request.headers.get('user-agent') ?? 'unknown',
      details: {
        reason: 'rate_limit_exceeded',
        retryAfter: rateLimitResult.retryAfter
      },
      severity: 'warning'
    });

    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=rate_limit`);
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirectTo = searchParams.get('redirectTo') ?? '/admin';

  if (code !== undefined && code !== '') {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Log authentication failure
      await AuditLogger.logAuthEvent(
        'login_failure',
        undefined,
        undefined,
        {
          ip: identifier.split(':')[0],
          userAgent: request.headers.get('user-agent') ?? 'unknown'
        },
        { provider: 'google', error: error.message }
      );
    } else {
      // Check if user has admin role
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        // Log successful authentication
        await AuditLogger.logAuthEvent(
          'login_success',
          user.email,
          user.id,
          {
            ip: identifier.split(':')[0],
            userAgent: request.headers.get('user-agent') ?? 'unknown'
          },
          { provider: 'google', role: profile?.role }
        );

        // Record successful auth for rate limiting
        RateLimiter.recordSuccess(identifier, 'auth');

        if (profile?.role === 'admin') {
          return NextResponse.redirect(`${origin}${redirectTo}`);
        } else {
          // Log unauthorized access attempt
          await AuditLogger.logSecurityEvent({
            event_type: 'permission_denied',
            user_id: user.id,
            user_email: user.email,
            ip_address: identifier.split(':')[0],
            user_agent: request.headers.get('user-agent') ?? 'unknown',
            details: {
              reason: 'insufficient_role',
              user_role: profile?.role ?? 'none'
            },
            severity: 'warning'
          });

          return NextResponse.redirect(`${origin}/access-denied`);
        }
      }
    }
  }

  // If there was an error or no code, redirect to login
  return NextResponse.redirect(`${origin}/login`);
}
