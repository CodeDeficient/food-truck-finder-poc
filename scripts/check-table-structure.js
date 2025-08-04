#!/usr/bin/env node

/**
 * Script to check the structure of a table in the database.
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

async function checkTableStructure(tableName) {
  console.log(`🔍 Checking structure of table: ${tableName}`);

  try {
    const { data, error } = await supabase.rpc('get_columns', {
      p_table_name: tableName,
    });

    if (error) {
      console.error(`❌ Error fetching table structure for ${tableName}:`, error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log(`🤔 Table not found or has no columns: ${tableName}`);
      return;
    }

    console.log(`\n📄 Structure of table: ${tableName}`);
    console.table(data);

  } catch (error) {
    console.error('💥 Fatal error in checking table structure:', error);
    process.exit(1);
  }
}

const tableName = process.argv[2];
if (!tableName) {
  console.error('❌ Please provide a table name as an argument.');
  console.log('Usage: node scripts/check-table-structure.js <table_name>');
  process.exit(1);
}

checkTableStructure(tableName).catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
