import { NextRequest, NextResponse } from 'next/server';
/**
* Create a Supabase client configured for middleware
* @example
* createSupabaseMiddlewareClient(request, response)
* Supabase client instance
* @param {NextRequest} _req - The incoming Next.js request object (unused).
* @param {NextResponse} _res - The outgoing Next.js response object (unused).
* @returns {SupabaseClient} Supabase client instance configured for middleware usage.
* @description
*   - Utilizes environment variables for Supabase URL and anon key.
*   - Sets `persistSession` to false for non-persistent authentication.
*   - Adds `x-middleware-auth` header for identification in middleware.
*/
export declare function createSupabaseMiddlewareClient(_req: NextRequest, _res: NextResponse): import("@supabase/supabase-js").SupabaseClient<Database, "public", any>;
