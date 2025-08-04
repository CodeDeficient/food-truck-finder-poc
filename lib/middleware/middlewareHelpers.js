import { NextResponse } from 'next/server';
import { AuditLogger } from '../../lib/security/auditLogger.js';
import { createSupabaseMiddlewareClient } from '../../lib/supabaseMiddleware.js';
/**
 * Logs a security event and redirects the request to a specified path.
 * @example
 * logSecurityEventAndRedirect({ req, res, logParams, redirectPath, redirectFromPath })
 * NextResponse with redirect to the target path
 * @param {Object} params - The parameters for the function.
 * @param {Request} params.req - The original request object containing the URL to clone for redirection.
 * @param {Response} params._res - The original response object (unused in function, but part of expected parameters).
 * @param {Object} params.logParams - Parameters required by the AuditLogger to log the security event.
 * @param {string} params.redirectPath - The pathname where the request should be redirected.
 * @param {string} [params.redirectFromPath] - Optional pathname indicating where the redirect originated from.
 * @returns {NextResponse} A response that performs a redirect to the specified path.
 * @description
 *   - The function uses AuditLogger to record the security event.
 *   - It clones the current URL from the request to ensure original query parameters are preserved.
 *   - Redirect path can optionally include info on where the redirect originated via a search parameter.
 */
async function logSecurityEventAndRedirect({ req, res: _res, logParams, redirectPath, redirectFromPath, }) {
    await AuditLogger.logSecurityEvent(logParams);
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = redirectPath;
    if (redirectFromPath) {
        redirectUrl.searchParams.set(`redirectedFrom`, redirectFromPath);
    }
    return NextResponse.redirect(redirectUrl);
}
/**
 * Logs a security event and redirects the user to the login page.
 * @example
 * logAndRedirect({
 *   req: requestObject,
 *   res: responseObject,
 *   requestMetadata: { ip: '192.168.1.1', userAgent: 'Mozilla/5.0', url: '/dashboard' },
 *   reason: 'Session Expired',
 *   userError: new Error('User authentication failed')
 * })
 * // Redirects user to login page and logs the event
 * @param {Object} req - Express request object containing details of the incoming request.
 * @param {Object} res - Express response object used to send a response to the client.
 * @param {Object} requestMetadata - Metadata associated with the request, including IP and user agent.
 * @param {string} reason - The reason for redirect, generally describing why access was denied.
 * @param {Error} userError - Optional error object that provides additional context about the user error.
 * @returns {Promise<void>} Returns a promise that resolves once the security event is logged and redirect is completed.
 * @description
 *   - Utilizes a severity of 'warning' when logging security events.
 *   - Redirects users from the attempted URL to the login page.
 *   - Captures detailed information about the request including attempted URL and user agent.
 */
async function logAndRedirect({ req, res, requestMetadata, reason, userError, }) {
    return logSecurityEventAndRedirect({
        req,
        res,
        logParams: {
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
        redirectPath: '/login',
        redirectFromPath: req.nextUrl.pathname,
    });
}
/**
 * Logs a security event and redirects to an access-denied page.
 * @example
 * logAndRedirectDenied({
 *   req: requestObject,
 *   res: responseObject,
 *   requestMetadata: metadataObject,
 *   user: userObject,
 *   profile: profileObject,
 *   profileQueryError: errorObject
 * })
 * // Redirects user and logs the event with relevant details
 * @param {Object} params - Contains necessary parameters for the function.
 * @param {Object} params.req - The HTTP request object.
 * @param {Object} params.res - The HTTP response object.
 * @param {Object} params.requestMetadata - Metadata related to the request.
 * @param {Object} params.user - User information object.
 * @param {Object} params.profile - Profile object related to the user.
 * @param {Object} params.profileQueryError - Error object if querying profile fails.
 * @returns {Promise<void>} Returns a promise that resolves after logging and redirecting.
 * @description
 *   - Utilizes `logSecurityEventAndRedirect` to perform logging and redirect operations.
 *   - The function assumes a structure for the user object, expecting 'id' and 'email' properties.
 *   - Redirects to '/access-denied' path by default.
 *   - Sets event severity as 'error' when logging the security event.
 */
async function logAndRedirectDenied({ req, res, requestMetadata, user, profile, profileQueryError, }) {
    return logSecurityEventAndRedirect({
        req,
        res,
        logParams: {
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
        redirectPath: '/access-denied',
    });
}
/**
 * Protects admin routes by verifying user authentication and authorization.
 * @example
 * protectAdminRoutes(req, res, requestMetadata)
 * returns NextResponse or redirects depending on user authentication status.
 * @param {NextRequest} req - The incoming request object.
 * @param {NextResponse} res - The response object to send back to the client.
 * @param {RequestMetadata} requestMetadata - Metadata about the request for logging purposes.
 * @returns {NextResponse} Returns the response object or redirects to an error page.
 * @description
 *   - Fetches and verifies the user's session from Supabase.
 *   - Checks if the user is an admin based on the profile 'role' from the database.
 *   - Logs access attempts to the admin panel for auditing purposes.
 *   - Redirects to an appropriate error handler if the user isn't authenticated or authorized.
 */
export async function protectAdminRoutes(req, res, requestMetadata) {
    const supabase = createSupabaseMiddlewareClient(req, res);
    const { data, error: userError } = await supabase.auth.getUser();
    const user = data?.user;
    if (userError || !user) {
        return logAndRedirect({
            req,
            res,
            requestMetadata,
            reason: 'no_session',
            userError: userError ?? undefined,
        });
    }
    // Explicitly type the result of the Supabase query
    const { data: profile, error: profileQueryError } = (await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single());
    if (profileQueryError || (profile && profile.role !== 'admin')) {
        return logAndRedirectDenied({
            req,
            res,
            requestMetadata,
            user,
            profile: profile ?? null,
            profileQueryError: profileQueryError ?? undefined,
        });
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
