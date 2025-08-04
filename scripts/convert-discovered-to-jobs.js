#!/usr/bin/env node

/**
 * Script to convert discovered URLs to pending scraping jobs
 * This bridges the gap between discovery and job processing
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

// Import autoScraper after Supabase is initialized to avoid circular dependencies
let autoScraper;

async function convertDiscoveredUrlsToJobs() {
  // Initialize autoScraper dynamically
  if (!autoScraper) {
    const module = await import('../lib/autoScraper.js');
    autoScraper = module.autoScraper;
  }
  
  console.log('🔍 Converting discovered URLs to pending jobs...');
  
  try {
    // Get URLs that are ready for processing (status: 'new')
    const { data: discoveredUrls, error } = await supabase
      .from('discovered_urls')
      .select('url, id')
      .eq('status', 'new')
      .limit(100); // Process more URLs

    if (error) {
      console.error('❌ Error fetching discovered URLs:', error.message);
      process.exit(1);
    }

    if (!discoveredUrls || discoveredUrls.length === 0) {
      console.log('✅ No new discovered URLs found');
      return;
    }

    console.log(`📦 Found ${discoveredUrls.length} new discovered URLs to convert to jobs`);

    let createdJobs = 0;
    let failedJobs = 0;

    // Convert each discovered URL to a pending job
    for (const { url, id } of discoveredUrls) {
      try {
        console.log(`🔄 Converting URL to job: ${url}`);
        
        const result = await autoScraper.triggerScrapingProcess(url);
        
        if (result.success) {
          createdJobs++;
          console.log(`✅ Job created for ${url} (ID: ${result.jobId})`);
          
          // Update the discovered URL status to 'processing'
          const { error: updateError } = await supabase
            .from('discovered_urls')
            .update({
              status: 'processing',
              last_processed_at: new Date().toISOString(),
              notes: `Job created: ${result.jobId}`
            })
            .eq('id', id);
            
          if (updateError) {
            console.warn(`⚠️  Failed to update discovered URL status for ${url}:`, updateError.message);
          }
        } else {
          failedJobs++;
          console.error(`❌ Failed to create job for ${url}:`, result.error);
          
          // Mark as irrelevant if job creation failed
          const { error: updateError } = await supabase
            .from('discovered_urls')
            .update({
              status: 'irrelevant',
              last_processed_at: new Date().toISOString(),
              notes: `Job creation failed: ${result.error}`
            })
            .eq('id', id);
            
          if (updateError) {
            console.warn(`⚠️  Failed to update discovered URL status for ${url}:`, updateError.message);
          }
        }
      } catch (error) {
        failedJobs++;
        console.error(`💥 Error processing URL ${url}:`, error.message);
      }
    }

    console.log('\n📊 Conversion Summary:');
    console.log(`  ✅ Successfully created: ${createdJobs} jobs`);
    console.log(`  ❌ Failed to create: ${failedJobs} jobs`);
    console.log(`  📦 Total URLs processed: ${discoveredUrls.length}`);

  } catch (error) {
    console.error('💥 Fatal error in conversion process:', error);
    process.exit(1);
  }
}

// Run the conversion
convertDiscoveredUrlsToJobs().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
