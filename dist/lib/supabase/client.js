import { createClient } from '@supabase/supabase-js';
let _supabase = null;
let _supabaseAdmin = null;
function initializeSupabase() {
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
export function getSupabase() {
    if (!_supabase) {
        initializeSupabase();
    }
    return _supabase;
}
export function getSupabaseAdmin() {
    if (!_supabaseAdmin) {
        initializeSupabase();
    }
    return _supabaseAdmin;
}
// Export null initially - these will be properly initialized when used
export const supabase = null;
export const supabaseAdmin = null;
