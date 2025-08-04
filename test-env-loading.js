#!/usr/bin/env node

// First import the Supabase client (this should work now with lazy initialization)
import { supabase, supabaseAdmin, getSupabase, getSupabaseAdmin } from './dist/lib/supabase/client.js';

console.log('Supabase client status BEFORE dotenv:');
console.log('supabase (direct export):', supabase ? 'INITIALIZED' : 'UNDEFINED');
console.log('supabaseAdmin (direct export):', supabaseAdmin ? 'INITIALIZED' : 'UNDEFINED');

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

console.log('\nEnvironment variables after dotenv load:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'NOT SET');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'NOT SET');
console.log('FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? 'SET' : 'NOT SET');
console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');

// Now try to get the clients using the lazy functions
console.log('\nSupabase client status AFTER dotenv:');
try {
  const lazySupabase = getSupabase();
  const lazySupabaseAdmin = getSupabaseAdmin();
  console.log('getSupabase():', lazySupabase ? 'INITIALIZED' : 'UNDEFINED');
  console.log('getSupabaseAdmin():', lazySupabaseAdmin ? 'INITIALIZED' : 'UNDEFINED');
} catch (error) {
  console.log('Error getting lazy clients:', error.message);
}
