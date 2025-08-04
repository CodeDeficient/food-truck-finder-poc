#!/usr/bin/env node

/**
 * Script to list all tables in the database.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials! Need both NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function listTables() {
  console.log('🔍 Listing all tables in the database...');

  try {
    const { data, error } = await supabase
      .rpc('get_columns', { p_table_name: 'food_trucks' });

    if (error) {
      console.error('❌ Error fetching table info:', error.message);
      process.exit(1);
    }

    console.log('Food trucks table structure:');
    console.log(data);

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

listTables().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
