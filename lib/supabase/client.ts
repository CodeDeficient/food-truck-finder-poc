import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Centralized Supabase client initialization that is safe for both
 * build-time (SSG) and runtime usage. Avoids exporting null placeholders
 * that cause "Cannot read properties of null (reading 'from'/'rpc')" during prerender.
 */

let _supabase: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

const supabaseUrl: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey: string | undefined = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize eagerly if env vars exist. We do NOT throw on missing env for admin.
// For public client, we throw upon first access if missing critical env.
if (supabaseUrl && supabaseAnonKey) {
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
}
// Admin client is optional and depends on service key
if (supabaseUrl && supabaseServiceKey) {
  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
}

export function getSupabase(): SupabaseClient {
  if (_supabase) return _supabase;
  // Lazily initialize if not initialized yet (e.g., env available later)
  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }
  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }
  _supabase = createClient(supabaseUrl, supabaseAnonKey);
  return _supabase;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (_supabaseAdmin) return _supabaseAdmin;
  // If service key not provided, admin is not available; return null
  if (!supabaseUrl || !supabaseServiceKey) {
    return null;
  }
  _supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
  return _supabaseAdmin;
}

// Export concrete values to satisfy compiled JS that imports { supabase, supabaseAdmin } directly.
export const supabase: SupabaseClient = getSupabase();
export const supabaseAdmin: SupabaseClient | null = getSupabaseAdmin();
