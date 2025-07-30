#!/usr/bin/env node

/**
 * GitHub Action Scraper Script
 * 
 * This script is designed to run in GitHub Actions to process pending scraping jobs.
 * It uses ESM imports and is compatible with Node.js 20+.
 * 
 * Usage: node scripts/github-action-scraper.js --limit 10
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { parseArgs } from 'node:util';

// Parse command line arguments
const options = {
  limit: {
    type: 'string',
    short: 'l',
    default: '10'
  },
  debug: {
    type: 'boolean',
    short: 'd',
    default: false
  },
  help: {
    type: 'boolean',
    short: 'h',
    default: false
  }
};

const { values } = parseArgs({ options, allowPositionals: false });

if (values.help) {
  console.log(`
GitHub Action Scraper

Usage: node scripts/github-action-scraper.js [options]

Options:
  -l, --limit <number>  Maximum number of jobs to process (default: 10)
  -d, --debug          Enable debug logging
  -h, --help           Show this help message

Environment Variables Required:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - FIRECRAWL_API_KEY
  - GEMINI_API_KEY or GOOGLE_API_KEY
  `);
  process.exit(0);
}

const limit = parseInt(values.limit || '10', 10);
const debugMode = values.debug || false;

// Debug logging function
function debugLog(...args) {
  if (debugMode) {
    console.log('🐛 DEBUG:', ...args);
  }
}

// Validate environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY', 
  'FIRECRAWL_API_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
  console.error('❌ Missing required environment variables:');
  missingEnvVars.forEach(envVar => console.error(`  - ${envVar}`));
  process.exit(1);
}

// Check for AI API key
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
  console.error('❌ Missing AI API key: either GEMINI_API_KEY or GOOGLE_API_KEY is required');
  process.exit(1);
}

console.log('🚀 GitHub Action Scraper Starting');
console.log(`📊 Processing up to ${limit} jobs`);
console.log(`🔗 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50)}...`);
if (debugMode) {
  console.log('🐛 Debug mode enabled');
  debugLog('Environment variables loaded:', { 
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasFirecrawlKey: !!process.env.FIRECRAWL_API_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasGoogleKey: !!process.env.GOOGLE_API_KEY
  });
}

// Import these after dotenv is loaded to ensure environment variables are available
let processScrapingJob, ScrapingJobService, DuplicatePreventionService;

async function initializeModules() {
  const { processScrapingJob: psj } = await import('../dist/lib/pipeline/scrapingProcessor.js');
  const { ScrapingJobService: sjs } = await import('../dist/lib/supabase/services/scrapingJobService.js');
  const { DuplicatePreventionService: dps } = await import('../dist/lib/data-quality/duplicatePrevention.js');
  
  processScrapingJob = psj;
  ScrapingJobService = sjs;
  DuplicatePreventionService = dps;
}

/**
 * Main execution function
 */
async function main() {
  // Initialize modules with environment variables loaded
  await initializeModules();

  let processedCount = 0;
  let successCount = 0;
  let failureCount = 0;
  let skippedCount = 0;

  try {
    console.log('\n📋 Fetching pending scraping jobs...');
    
    // Get pending jobs from Supabase
    const pendingJobs = await ScrapingJobService.getJobsByStatus('pending');
    
    if (!pendingJobs || pendingJobs.length === 0) {
      console.log('✅ No pending jobs found');
      return;
    }

    console.log(`📦 Found ${pendingJobs.length} pending jobs`);
    
    // Limit the number of jobs to process
    const jobsToProcess = pendingJobs.slice(0, limit);
    console.log(`⚡ Processing ${jobsToProcess.length} jobs`);

    // Process jobs sequentially to avoid overwhelming APIs
    for (const job of jobsToProcess) {
      processedCount++;
      console.log(`\n[${processedCount}/${jobsToProcess.length}] Processing job: ${job.id}`);
      console.log(`🎯 Target URL: ${job.target_url}`);

      // Early duplicate check
      console.log(`🔍 Checking for duplicates for URL: ${job.target_url}`);
      const { isDuplicate, reason } = await DuplicatePreventionService.isDuplicateUrl(job.target_url);

      if (isDuplicate) {
        skippedCount++;
        console.log(`🚫 Duplicate found for URL: ${job.target_url}. Reason: ${reason}. Skipping job.`);
        await ScrapingJobService.updateJobStatus(job.id, 'completed', {
            completed_at: new Date().toISOString(),
            message: `Skipped: Duplicate URL found before processing. Reason: ${reason}`
        });
        continue; // Skip to the next job
      }
      
      try {
        // Process the scraping job using the pipeline
        await processScrapingJob(job.id);
        successCount++;
        console.log(`✅ Job ${job.id} completed successfully`);
      } catch (error) {
        failureCount++;
        console.error(`❌ Job ${job.id} failed:`, error.message);
        
        // Log the error but continue processing other jobs
        console.error('Error details:', error);
      }

      // Add a small delay between jobs to be respectful to APIs
      if (processedCount < jobsToProcess.length) {
        console.log('⏱️  Waiting 2 seconds before next job...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

  } catch (error) {
    console.error('💥 Fatal error in main execution:', error);
    process.exit(1);
  }

  // Final summary
  console.log('\n📊 Processing Summary:');
  console.log(`  Total processed: ${processedCount}`);
  console.log(`  Successful: ${successCount} ✅`);
  console.log(`  Failed: ${failureCount} ❌`);
  console.log(`  Skipped (Duplicates): ${skippedCount} 🚫`);
  const attemptedCount = processedCount - skippedCount;
  console.log(`  Success rate (of attempted): ${attemptedCount > 0 ? Math.round((successCount / attemptedCount) * 100) : 0}%`);

  if (failureCount > 0) {
    console.log('\n⚠️  Some jobs failed. Check the logs above for details.');
    // Don't exit with error code as partial success is acceptable
  }

  console.log('\n🏁 GitHub Action Scraper completed');
}

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error('💥 Unhandled error in main:', error);
  process.exit(1);
});
