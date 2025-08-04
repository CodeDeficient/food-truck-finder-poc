import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { RateLimiter, getClientIdentifier } from '@/lib/security/rateLimiter';
import { AuditLogger } from '@/lib/security/auditLogger';
async function handleSuccessfulAuth({ user, redirectTo, origin, identifier, requestMetadata, }) {
    var _a;
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
        details: { provider: 'google', role: profile === null || profile === void 0 ? void 0 : profile.role },
    });
    RateLimiter.recordSuccess(identifier, 'auth');
    if ((profile === null || profile === void 0 ? void 0 : profile.role) === 'admin') {
        return NextResponse.redirect(`${origin}${redirectTo}`);
    }
    else {
        await AuditLogger.logSecurityEvent({
            event_type: 'permission_denied',
            user_id: user.id,
            user_email: user.email,
            ip_address: requestMetadata.ip,
            user_agent: requestMetadata.userAgent,
            details: {
                reason: 'insufficient_role',
                user_role: (_a = profile === null || profile === void 0 ? void 0 : profile.role) !== null && _a !== void 0 ? _a : 'none',
            },
            severity: 'warning',
        });
        return NextResponse.redirect(`${origin}/access-denied`);
    }
}
async function handleAuthFailure(error, identifier, requestMetadata) {
    await AuditLogger.logAuthEvent({
        eventType: 'login_failure',
        userEmail: undefined,
        userId: undefined,
        request: requestMetadata,
        details: { provider: 'google', error: error.message },
    });
}
export async function GET(request) {
    var _a, _b, _c;
    const identifier = getClientIdentifier(request);
    const rateLimitResult = RateLimiter.checkRateLimit(identifier, 'auth');
    if (!rateLimitResult.allowed) {
        await AuditLogger.logSecurityEvent({
            event_type: 'login_failure',
            ip_address: identifier.split(':')[0],
            user_agent: (_a = request.headers.get('user-agent')) !== null && _a !== void 0 ? _a : 'unknown',
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
    const redirectTo = (_b = searchParams.get('redirectTo')) !== null && _b !== void 0 ? _b : '/admin';
    const requestMetadata = {
        ip: identifier.split(':')[0],
        userAgent: (_c = request.headers.get('user-agent')) !== null && _c !== void 0 ? _c : 'unknown',
    };
    if (code !== null && code.length > 0) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
            await handleAuthFailure(error, identifier, requestMetadata);
        }
        else {
            const { data: { user }, } = await supabase.auth.getUser();
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
