import { type NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
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
  supabase,
}: {
  user: User;
  redirectTo: string;
  origin: string;
  identifier: string;
  requestMetadata: RequestMetadata;
  supabase: any;
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
    // For regular login, everyone goes to homepage
    return NextResponse.redirect(`${origin}/`);
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
  // Create Supabase client for this request
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables');
    return NextResponse.redirect(`${new URL(request.url).origin}/login?error=config`);
  }
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
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
      // On error, redirect to login with error message
      return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
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
          supabase,
        });
      }
    }
  }

  // Check if user is already authenticated
  const { data: { user: existingUser } } = await supabase.auth.getUser();
  if (existingUser) {
    // User is already logged in, redirect them appropriately
    return await handleSuccessfulAuth({
      user: existingUser,
      redirectTo,
      origin,
      identifier,
      requestMetadata,
      supabase,
    });
  }

  // Only redirect to login if there's no code AND no existing session
  return NextResponse.redirect(`${origin}/login?error=no_code`);
}
