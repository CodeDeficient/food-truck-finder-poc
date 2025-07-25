import { createClient } from '@supabase/supabase-js';
// @ts-expect-error TS(2306): File 'C:/AI/food-truck-finder-poc/lib/database.typ... Remove this comment to see the full error message
import { Database } from './database.types';
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
export function createSupabaseMiddlewareClient(_req, _res) {
    // Create a Supabase client configured for middleware
    return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        auth: {
            persistSession: false,
        },
        global: {
            headers: { 'x-middleware-auth': 'true' },
        },
    });
}
