import { NextRequest, NextResponse } from 'next/server';
interface RequestMetadata {
    ip: string;
    userAgent: string;
    url: string;
    method: string;
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
export declare function protectAdminRoutes(req: NextRequest, res: NextResponse, requestMetadata: RequestMetadata): Promise<NextResponse<unknown>>;
export {};
