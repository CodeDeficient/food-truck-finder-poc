#!/usr/bin/env node
/**
 * GitHub Action Scraper Script (TypeScript)
 *
 * This script is designed to run in GitHub Actions to process pending scraping jobs.
 * It uses ESM imports and is compatible with Node.js 20+.
 *
 * Usage: node src/actions/github-action-scraper.js --limit 10
 */
import { parseArgs } from 'node:util';
import { processScrapingJob } from '../../../../dist/lib/pipeline/scrapingProcessor.js';
import { ScrapingJobService } from '../../../../dist/lib/supabase/services/scrapingJobService.js';
// Parse command line arguments
const options = {
    limit: {
        type: 'string',
        short: 'l',
        default: '10'
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

Usage: node src/actions/github-action-scraper.js [options]

Options:
  -l, --limit <number>  Maximum number of jobs to process (default: 10)
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
/**
 * Main execution function
 */
async function main() {
    let processedCount = 0;
    let successCount = 0;
    let failureCount = 0;
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
            try {
                // Process the scraping job using the pipeline
                await processScrapingJob(job.id);
                successCount++;
                console.log(`✅ Job ${job.id} completed successfully`);
            }
            catch (error) {
                failureCount++;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`❌ Job ${job.id} failed:`, errorMessage);
                // Log the error but continue processing other jobs
                console.error('Error details:', error);
            }
            // Add a small delay between jobs to be respectful to APIs
            if (processedCount < jobsToProcess.length) {
                console.log('⏱️  Waiting 2 seconds before next job...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    catch (error) {
        console.error('💥 Fatal error in main execution:', error);
        process.exit(1);
    }
    // Final summary
    console.log('\n📊 Processing Summary:');
    console.log(`  Total processed: ${processedCount}`);
    console.log(`  Successful: ${successCount} ✅`);
    console.log(`  Failed: ${failureCount} ❌`);
    console.log(`  Success rate: ${processedCount > 0 ? Math.round((successCount / processedCount) * 100) : 0}%`);
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
// Run the main function using top-level await for pure ESM module
await main().catch((error) => {
    console.error('💥 Unhandled error in main:', error);
    process.exit(1);
});
