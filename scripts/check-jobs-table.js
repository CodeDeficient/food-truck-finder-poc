#!/usr/bin/env node

/**
 * Script to check scraping_jobs table structure
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkJobsTable() {
  console.log('🔍 Checking scraping_jobs table structure...');
  
  try {
    // Get table info
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Error fetching table info:', error.message);
      return;
    }

    if (data && data.length > 0) {
      console.log('📋 scraping_jobs table fields:');
      Object.keys(data[0]).forEach(key => console.log(`  - ${key}`));
      
      // Check for job_type enum values if it exists
      console.log('\n🔍 Checking job_type column...');
      const { data: jobTypes, error: jobTypeError } = await supabase
        .from('scraping_jobs')
        .select('job_type')
        .not('job_type', 'is', null)
        .limit(5);

      if (jobTypeError) {
        console.log('⚠️  Could not fetch job_type values:', jobTypeError.message);
      } else if (jobTypes && jobTypes.length > 0) {
        const uniqueTypes = [...new Set(jobTypes.map(item => item.job_type))];
        console.log('📋 Available job_type values:', uniqueTypes);
      }
    } else {
      console.log('✅ scraping_jobs table is empty');
    }
  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the check
checkJobsTable().catch((error) => {
  console.error('💥 Unhandled error:', error);
});
