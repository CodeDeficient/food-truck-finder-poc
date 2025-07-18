// scripts/verify-supabase.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Error: Supabase URL or anon key not found in .env.local');
  console.error('Please make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifySupabaseConnection() {
  console.log('Attempting to connect to Supabase...');

  try {
    const { data, error } = await supabase
      .from('food_trucks')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('✅ Supabase connection successful!');
      console.log('Successfully fetched data:', data);
    } else {
        console.log('✅ Supabase connection successful, but no trucks were returned.');
        console.log('This might be expected if the "food_trucks" table is empty.');
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
  }
}

verifySupabaseConnection();
