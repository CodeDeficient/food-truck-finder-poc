#!/usr/bin/env node

/**
 * Script to check recently completed scraping jobs.
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

async function checkCompletedJobs() {
  console.log('🔍 Checking recently completed jobs...');

  try {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching completed jobs:', error.message);
      process.exit(1);
    }

    if (!data || data.length === 0) {
      console.log('✅ No completed jobs found.');
      return;
    }

    console.log(`\n📄 Found ${data.length} recently completed jobs:`);
    console.table(data);

  } catch (error) {
    console.error('💥 Fatal error in checking completed jobs:', error);
    process.exit(1);
  }
}

checkCompletedJobs().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
