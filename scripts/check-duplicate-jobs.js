#!/usr/bin/env node

/**
 * Script to check for duplicate URLs in pending scraping jobs
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

async function checkDuplicateJobs() {
  console.log('🔍 Checking for duplicate URLs in pending scraping jobs...');
  
  try {
    // Get all pending jobs
    const { data: pendingJobs, error } = await supabase
      .from('scraping_jobs')
      .select('id, target_url, created_at')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching pending jobs:', error.message);
      return;
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      console.log('✅ No pending jobs found.');
      return;
    }

    console.log(`📊 Found ${pendingJobs.length} pending jobs`);

    // Group jobs by URL
    const urlGroups = {};
    pendingJobs.forEach(job => {
      if (!urlGroups[job.target_url]) {
        urlGroups[job.target_url] = [];
      }
      urlGroups[job.target_url].push(job);
    });

    // Find duplicates
    const duplicates = Object.entries(urlGroups).filter(([_, jobs]) => jobs.length > 1);
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate URLs found in pending jobs.');
      return;
    }

    console.log(`\n⚠️  Found ${duplicates.length} URLs with duplicates:`);
    console.log('=' .repeat(50));
    
    duplicates.forEach(([url, jobs]) => {
      console.log(`\n🔗 ${url}`);
      console.log(`   📦 ${jobs.length} duplicate jobs:`);
      jobs.forEach(job => {
        console.log(`     - ID: ${job.id} (Created: ${new Date(job.created_at).toISOString()})`);
      });
    });

    // Summary
    const totalDuplicates = duplicates.reduce((sum, [_, jobs]) => sum + jobs.length, 0);
    const uniqueUrlsWithDuplicates = duplicates.length;
    
    console.log('\n' + '=' .repeat(50));
    console.log(`📊 Summary:`);
    console.log(`   🔗 Unique URLs with duplicates: ${uniqueUrlsWithDuplicates}`);
    console.log(`   📦 Total duplicate jobs: ${totalDuplicates}`);
    console.log(`   🧹 Potential jobs to clean up: ${totalDuplicates - uniqueUrlsWithDuplicates}`);

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the check
checkDuplicateJobs().catch((error) => {
  console.error('💥 Unhandled error:', error);
});
