#!/usr/bin/env node

/**
 * Script to reset the status of specified jobs to 'pending'.
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

async function resetJobs(jobIds) {
  console.log(`🔍 Resetting jobs: ${jobIds.join(', ')}`);

  try {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .update({ status: 'pending', retry_count: 0 })
      .in('id', jobIds);

    if (error) {
      console.error('❌ Error resetting jobs:', error.message);
      process.exit(1);
    }

    console.log('✅ Jobs reset successfully.');

  } catch (error) {
    console.error('💥 Fatal error in resetting jobs:', error);
    process.exit(1);
  }
}

const jobIds = process.argv.slice(2);
if (jobIds.length === 0) {
  console.error('❌ Please provide at least one job ID as an argument.');
  console.log('Usage: node scripts/reset-jobs.js <job_id_1> <job_id_2> ...');
  process.exit(1);
}

resetJobs(jobIds).catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
