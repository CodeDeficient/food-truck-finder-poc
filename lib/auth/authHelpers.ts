import { NextResponse } from 'next/server';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { RateLimiter } from '@/lib/security/rateLimiter';
import { AuditLogger } from '@/lib/security/auditLogger';

interface RequestMetadata {
  ip: string;
  userAgent: string;
}

/**
 * Handles successful authentication by verifying user role and logging events.
 * @example
 * handleSuccessfulAuth({
 *   user: { id: '123', email: 'user@example.com' },
 *   redirectTo: '/dashboard',
 *   origin: 'http://localhost:3000',
 *   identifier: 'abc123',
 *   requestMetadata: { ip: '192.168.0.1', userAgent: 'Mozilla/5.0' }
 * })
 * // Either redirects to specified path or access-denied page based on user role
 * @param {Object} options - An object containing necessary authentication details.
 * @param {User} options.user - The user's information including ID and email.
 * @param {string} options.redirectTo - Path to redirect upon successful authentication.
 * @param {string} options.origin - The origin to prepend to redirect paths.
 * @param {string} options.identifier - Unique identifier for rate limiting.
 * @param {RequestMetadata} options.requestMetadata - Metadata of the request including IP and user-agent.
 * @returns {NextResponse} NextResponse object indicating redirection based on user role.
 * @description
 *   - Checks user role from the 'profiles' table.
 *   - Logs authentication and security events with different severities.
 *   - Employs rate limiting for successful authentication attempts.
 *   - Redirects based on user's role, serving admin and non-admin users differently.
 */
export async function handleSuccessfulAuth(options: {
  user: User;
  redirectTo: string;
  origin: string;
  identifier: string;
  requestMetadata: RequestMetadata;
}) {
  const { user, redirectTo, origin, identifier, requestMetadata } = options;
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

  if (profile?.role === 'admin') {
    return NextResponse.redirect(`${origin}${redirectTo}`);
  } 
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

export async function handleAuthFailure(
  error: Error,
  identifier: string,
  requestMetadata: RequestMetadata,
) {
  await AuditLogger.logAuthEvent({
    eventType: 'login_failure',
    request: requestMetadata,
    details: { provider: 'google', error: error.message },
  });
}
