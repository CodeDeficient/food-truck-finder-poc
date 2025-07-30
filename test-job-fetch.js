#!/usr/bin/env node

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

async function testJobFetch() {
  console.log('🔍 Testing job fetch directly from Supabase...');
  
  try {
    // Test 1: Fetch all jobs
    console.log('\n📋 Fetching all jobs...');
    const { data: allJobs, error: allError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .limit(5);
    
    if (allError) {
      console.error('❌ Error fetching all jobs:', allError.message);
    } else {
      console.log(`✅ Found ${allJobs.length} jobs total`);
      allJobs.forEach(job => {
        console.log(`  - ${job.id}: ${job.status} - ${job.target_url}`);
      });
    }
    
    // Test 2: Fetch pending jobs
    console.log('\n📋 Fetching pending jobs...');
    const { data: pendingJobs, error: pendingError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('status', 'pending')
      .limit(5);
    
    if (pendingError) {
      console.error('❌ Error fetching pending jobs:', pendingError.message);
    } else {
      console.log(`✅ Found ${pendingJobs.length} pending jobs`);
      pendingJobs.forEach(job => {
        console.log(`  - ${job.id}: ${job.status} - ${job.target_url}`);
      });
    }
    
    // Test 3: Count jobs by status
    console.log('\n📊 Job count by status:');
    const { data: statusCounts, error: countError } = await supabase
      .from('scraping_jobs')
      .select('status');
    
    if (countError) {
      console.error('❌ Error counting jobs by status:', countError.message);
    } else {
      // Group and count manually
      const counts = {};
      statusCounts.forEach(row => {
        counts[row.status] = (counts[row.status] || 0) + 1;
      });
      Object.keys(counts).forEach(status => {
        console.log(`  - ${status}: ${counts[status]}`);
      });
    }
    
    if (countError) {
      console.error('❌ Error counting jobs by status:', countError.message);
    } else {
      statusCounts.forEach(row => {
        console.log(`  - ${row.status}: ${row.count}`);
      });
    }
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

testJobFetch();
