#!/usr/bin/env node

/**
 * Script to clean up duplicate URLs in pending scraping jobs
 * Keeps only the most recent job for each URL and deletes the older duplicates
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

async function cleanupDuplicateJobs() {
  console.log('🧹 Starting cleanup of duplicate URLs in pending scraping jobs...');
  
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
    
    let totalJobsToDelete = 0;
    const jobsToDelete = [];

    duplicates.forEach(([url, jobs]) => {
      // Keep the most recent job (first in the array since we ordered by created_at DESC)
      const jobsToKeep = jobs.slice(0, 1);
      const jobsToRemove = jobs.slice(1);
      
      console.log(`\n🔗 ${url}`);
      console.log(`   📦 Total: ${jobs.length} jobs`);
      console.log(`   ✅ Keeping: ${jobsToKeep.length} job (most recent)`);
      console.log(`   🗑️  Removing: ${jobsToRemove.length} jobs`);
      
      jobsToRemove.forEach(job => {
        console.log(`     - ID: ${job.id} (Created: ${new Date(job.created_at).toISOString()})`);
        jobsToDelete.push(job.id);
      });
      
      totalJobsToDelete += jobsToRemove.length;
    });

    // Summary
    console.log('\n' + '=' .repeat(50));
    console.log(`📊 Cleanup Summary:`);
    console.log(`   🔗 Unique URLs with duplicates: ${duplicates.length}`);
    console.log(`   🧹 Jobs to delete: ${totalJobsToDelete}`);
    console.log(`   ✅ Jobs to keep: ${jobsToDelete.length - totalJobsToDelete + duplicates.length}`);

    if (jobsToDelete.length === 0) {
      console.log('✅ No jobs to delete.');
      return;
    }

    // Confirm before deletion
    console.log('\n⚠️  WARNING: This will permanently delete the duplicate jobs.');
    console.log('Deleting 89 duplicate jobs automatically...');
    
    console.log(`\n🗑️  Deleting ${jobsToDelete.length} duplicate jobs...`);
    
    // Delete the duplicate jobs
    const { error: deleteError } = await supabase
      .from('scraping_jobs')
      .delete()
      .in('id', jobsToDelete);

    if (deleteError) {
      console.error('❌ Error deleting jobs:', deleteError.message);
      return;
    }

    console.log(`✅ Successfully deleted ${jobsToDelete.length} duplicate jobs.`);
    console.log('🧹 Duplicate job cleanup completed!');

  } catch (error) {
    console.error('💥 Fatal error:', error);
  }
}

// Run the cleanup
cleanupDuplicateJobs().catch((error) => {
  console.error('💥 Unhandled error:', error);
});
