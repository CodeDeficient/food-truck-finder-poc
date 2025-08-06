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
  
  // Check if we're in browser environment
  if (typeof window === 'undefined') {
    // During SSR, create a minimal client that won't cause hydration issues
    if (!supabaseUrl || !supabaseAnonKey) {
      // Create a dummy client for SSR that won't be used
      return createClient('https://dummy.supabase.co', 'dummy-key');
    }
  }
  
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
// Simple lazy initialization without Proxy to avoid SSR/hydration issues
let _exportedSupabase: SupabaseClient | null = null;
let _exportedSupabaseAdmin: SupabaseClient | null | undefined;

function ensureSupabase(): SupabaseClient {
  if (!_exportedSupabase) {
    _exportedSupabase = getSupabase();
  }
  return _exportedSupabase;
}

function ensureSupabaseAdmin(): SupabaseClient | null {
  if (_exportedSupabaseAdmin === undefined) {
    _exportedSupabaseAdmin = getSupabaseAdmin();
  }
  return _exportedSupabaseAdmin;
}

// Create the actual client instances
export const supabase = {
  get auth() { return ensureSupabase().auth; },
  get from() { return ensureSupabase().from.bind(ensureSupabase()); },
  get rpc() { return ensureSupabase().rpc.bind(ensureSupabase()); },
  get storage() { return ensureSupabase().storage; },
  get realtime() { return ensureSupabase().realtime; },
  get functions() { return ensureSupabase().functions; },
  get channel() { return ensureSupabase().channel.bind(ensureSupabase()); },
  get removeAllChannels() { return ensureSupabase().removeAllChannels.bind(ensureSupabase()); },
  get removeChannel() { return ensureSupabase().removeChannel.bind(ensureSupabase()); },
  get getChannels() { return ensureSupabase().getChannels.bind(ensureSupabase()); }
};

export const supabaseAdmin: SupabaseClient | null = ensureSupabaseAdmin();
