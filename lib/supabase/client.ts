import { createClient } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

function initializeSupabase(): void {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  _supabaseAdmin = supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey)
    : null;
}

export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    initializeSupabase();
  }
  return _supabase!;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!_supabaseAdmin) {
    initializeSupabase();
  }
  return _supabaseAdmin;
}

// Export null initially - these will be properly initialized when used
export const supabase = null as unknown as SupabaseClient;
export const supabaseAdmin = null as unknown as SupabaseClient | null;
