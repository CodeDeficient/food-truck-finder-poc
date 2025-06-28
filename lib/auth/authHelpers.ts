import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { RateLimiter } from '@/lib/security/rateLimiter';
import { AuditLogger } from '@/lib/security/auditLogger';

interface RequestMetadata {
  ip: string;
  userAgent: string;
}

export async function handleSuccessfulAuth(
  user: User,
  redirectTo: string,
  origin: string,
  identifier: string,
  requestMetadata: RequestMetadata,
) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  await AuditLogger.logAuthEvent(
    'login_success',
    user.email,
    user.id,
    requestMetadata,
    { provider: 'google', role: profile?.role },
  );

  RateLimiter.recordSuccess(identifier, 'auth');

  if (profile?.role === 'admin') {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  } else {
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

export async function handleAuthFailure(
  error: Error,
  identifier: string,
  requestMetadata: RequestMetadata,
) {
  await AuditLogger.logAuthEvent(
    'login_failure',
    undefined,
    undefined,
    requestMetadata,
    { provider: 'google', error: error.message },
  );
}
