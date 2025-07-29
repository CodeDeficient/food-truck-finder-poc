#!/usr/bin/env node

/**
 * Script to fetch food truck entries with the name "Unknown Food Truck".
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

async function getUnknownTrucks() {
  console.log('🔍 Fetching "Unknown Food Truck" entries...');

  try {
    const { data, error } = await supabase
      .from('food_trucks')
      .select('*')
      .ilike('name', '%Unknown Food Truck%');

    if (error) {
      console.error('❌ Error fetching unknown trucks:', error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log('✅ No "Unknown Food Truck" entries found.');
      return;
    }

    console.log(`\n📄 Found ${data.length} "Unknown Food Truck" entries:`);
    console.table(data);

  } catch (error) {
    console.error('💥 Fatal error in fetching unknown trucks:', error);
    process.exit(1);
  }
}

getUnknownTrucks().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
