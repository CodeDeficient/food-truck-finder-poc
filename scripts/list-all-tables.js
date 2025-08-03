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
    // Query information schema directly
    const { data, error } = await supabase
      .from('information_schema.columns')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) {
      console.error('❌ Error fetching tables:', error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log('🤔 No tables found in public schema');
      return;
    }

    // Get unique table names
    const tableNames = [...new Set(data.map(row => row.table_name))].sort();
    
    console.log('\n📄 Tables in public schema:');
    tableNames.forEach(tableName => {
      console.log(`  - ${tableName}`);
    });

    // Check for profiles table specifically
    if (tableNames.includes('profiles')) {
      console.log('\n🔍 Checking profiles table structure...');
      const { data: profileData, error: profileError } = await supabase
        .rpc('get_columns', { p_table_name: 'profiles' });
      
      if (profileError) {
        console.error('❌ Error fetching profiles table info:', profileError.message);
      } else {
        console.log('Profiles table structure:');
        console.log(profileData);
      }
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

listTables().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
