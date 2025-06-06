import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { NextRequest, NextResponse } from 'next/server';

export function createSupabaseMiddlewareClient(_req: NextRequest, _res: NextResponse) {
  // Create a Supabase client configured for middleware
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
      },
      global: {
        headers: { 'x-middleware-auth': 'true' },
      },
    },
  );
}
