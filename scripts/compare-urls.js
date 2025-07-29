#!/usr/bin/env node

/**
 * Script to compare pending job URLs with new discovered URLs
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

async function compareUrls() {
  console.log('🔍 Comparing pending jobs with new discovered URLs...');
  
  try {
    // Get pending job URLs
    const { data: pendingJobs, error: jobsError } = await supabase
      .from('scraping_jobs')
      .select('target_url')
      .eq('status', 'pending');

    if (jobsError) {
      console.error('❌ Error fetching pending jobs:', jobsError.message);
      process.exit(1);
    }

    const pendingUrls = new Set(pendingJobs.map(job => job.target_url));
    console.log(`📊 Pending jobs: ${pendingUrls.size} URLs`);

    // Get new discovered URLs
    const { data: newUrls, error: urlsError } = await supabase
      .from('discovered_urls')
      .select('url')
      .eq('status', 'new');

    if (urlsError) {
      console.error('❌ Error fetching new URLs:', urlsError.message);
      process.exit(1);
    }

    console.log(`📊 New discovered URLs: ${newUrls.length} URLs`);

    // Check overlap
    const newUrlSet = new Set(newUrls.map(u => u.url));
    const overlap = [...pendingUrls].filter(url => newUrlSet.has(url));
    
    console.log(`📊 Overlap (URLs that are both pending and new): ${overlap.length} URLs`);
    
    if (overlap.length > 0) {
      console.log('\n📋 Overlapping URLs:');
      overlap.slice(0, 10).forEach(url => console.log(`  ${url}`));
      if (overlap.length > 10) {
        console.log(`  ... and ${overlap.length - 10} more`);
      }
    }

    // Check if pending URLs are in new URLs
    const pendingInNew = [...pendingUrls].filter(url => newUrlSet.has(url));
    console.log(`\n📊 Pending URLs that are still marked as 'new': ${pendingInNew.length}`);
    
    if (pendingInNew.length > 0) {
      console.log('⚠️  These URLs have jobs created but are still marked as "new" in discovered_urls');
      console.log('   This suggests the status update may have failed or not been applied');
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the comparison
compareUrls().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
