#!/usr/bin/env node

/**
 * Safe script to convert discovered URLs to pending scraping jobs
 * Processes URLs one at a time with enhanced duplicate checking and safety measures
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

// Simple trigger function since we can't import autoScraper
async function triggerScrapingProcess(url) {
  try {
    // Create a new scraping job
    const { data: job, error } = await supabase
      .from('scraping_jobs')
      .insert({
        target_url: url,
        job_type: 'website_scrape',
        status: 'pending',
        priority: 1,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: `Failed to create job: ${error.message}`
      };
    }

    return {
      success: true,
      jobId: job.id
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to trigger scraping process: ${error.message}`
    };
  }
}

async function safeConvertDiscoveredUrlsToJobs() {
  console.log('🔍 Starting safe conversion of discovered URLs to pending jobs...');
  
  try {
    // Get URLs that are ready for processing (status: 'new')
    const { data: discoveredUrls, error } = await supabase
      .from('discovered_urls')
      .select('url, id, processing_attempts')
      .eq('status', 'new')
      .order('processing_attempts', { ascending: true }) // Process URLs with fewer attempts first
      .limit(10); // Small batch for safety

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
    let skippedUrls = 0;

    // Process each URL with safety checks
    for (const [index, urlRecord] of discoveredUrls.entries()) {
      const { url, id, processing_attempts } = urlRecord;
      
      console.log(`\n--- Processing URL ${index + 1}/${discoveredUrls.length} ---`);
      console.log(`🔄 URL: ${url}`);
      console.log(`📊 Processing Attempts: ${processing_attempts || 0}`);
      
      // Skip URLs with too many failed attempts
      if ((processing_attempts || 0) >= 3) {
        console.log(`⏭️  Skipping URL with too many failures: ${url}`);
        skippedUrls++;
        continue;
      }
      
      try {
        console.log(`🚀 Creating job for: ${url}`);
        
        // Use our local trigger function
        const result = await triggerScrapingProcess(url);
        
        if (result.success) {
          createdJobs++;
          console.log(`✅ Job created for ${url} (ID: ${result.jobId})`);
          
          // Update the discovered URL status to 'processing'
          const { error: updateError } = await supabase
            .from('discovered_urls')
            .update({
              status: 'processing',
              last_processed_at: new Date().toISOString(),
              notes: `Job created: ${result.jobId}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);
            
          if (updateError) {
            console.warn(`⚠️  Failed to update discovered URL status for ${url}:`, updateError.message);
          }
          
          // Small delay between job creation to avoid overwhelming the system
          if (createdJobs < discoveredUrls.length) {
            console.log('⏳ Waiting 2 seconds before next job...');
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } else {
          failedJobs++;
          console.error(`❌ Failed to create job for ${url}:`, result.error);
          
          // Increment processing attempts and mark as failed
          const { error: updateError } = await supabase
            .from('discovered_urls')
            .update({
              processing_attempts: (processing_attempts || 0) + 1,
              last_processed_at: new Date().toISOString(),
              notes: `Job creation failed: ${result.error}`,
              updated_at: new Date().toISOString()
            })
            .eq('id', id);
            
          if (updateError) {
            console.warn(`⚠️  Failed to update discovered URL status for ${url}:`, updateError.message);
          }
        }
      } catch (error) {
        failedJobs++;
        console.error(`💥 Error processing URL ${url}:`, error.message);
        
        // Increment processing attempts and mark as failed
        await supabase
          .from('discovered_urls')
          .update({
            processing_attempts: (processing_attempts || 0) + 1,
            last_processed_at: new Date().toISOString(),
            notes: `Processing error: ${error.message}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      }
    }

    console.log('\n📊 Safe Conversion Summary:');
    console.log(`  ✅ Successfully created: ${createdJobs} jobs`);
    console.log(`  ❌ Failed to create: ${failedJobs} jobs`);
    console.log(`  ⏭️  Skipped: ${skippedUrls} URLs`);
    console.log(`  📦 Total URLs processed: ${discoveredUrls.length}`);

  } catch (error) {
    console.error('💥 Fatal error in conversion process:', error);
    process.exit(1);
  }
}

// Run the conversion
safeConvertDiscoveredUrlsToJobs().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
