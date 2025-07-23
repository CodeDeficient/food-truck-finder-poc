import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { processScrapingJob } from '../lib/pipelineProcessor.js';
import fs from 'fs';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Parse command line arguments
const args = process.argv.slice(2);
const limitArg = args.find(arg => arg.startsWith('--limit='));
const limit = limitArg ? parseInt(limitArg.split('=')[1]) : 10;

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create log file
const logFile = `scraping-${new Date().toISOString().split('T')[0]}.log`;
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(logFile, logMessage + '\n');
};

async function main() {
  log('=== GitHub Action Food Truck Scraper ===');
  log(`Processing limit: ${limit} jobs`);

  try {
    // Step 1: Create new jobs for URLs that need scraping
    log('\n--- Step 1: Creating scraping jobs ---');
    const { autoScraper } = await import('../lib/autoScraper.js');
    const createResult = await autoScraper.runAutoScraping();
    log(`Created ${createResult.newTrucksFound} new jobs, ${createResult.trucksProcessed} total processed`);

    // Step 2: Get pending jobs
    log('\n--- Step 2: Fetching pending jobs ---');
    const { data: pendingJobs, error: fetchError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .limit(limit);

    if (fetchError) {
      throw new Error(`Failed to fetch pending jobs: ${fetchError.message}`);
    }

    log(`Found ${pendingJobs.length} pending jobs to process`);

    // Step 3: Process jobs
    log('\n--- Step 3: Processing jobs ---');
    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0,
      errors: []
    };

    for (const job of pendingJobs) {
      log(`\nProcessing job ${job.id} for URL: ${job.target_url}`);
      results.processed++;

      try {
        // Process with a reasonable timeout (5 minutes per job)
        const processPromise = processScrapingJob(job.id);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Job processing timeout (5 minutes)')), 5 * 60 * 1000)
        );

        await Promise.race([processPromise, timeoutPromise]);
        
        results.succeeded++;
        log(`✓ Successfully processed job ${job.id}`);
      } catch (error) {
        results.failed++;
        const errorMsg = error.message || 'Unknown error';
        results.errors.push(`Job ${job.id}: ${errorMsg}`);
        
        log(`✗ Failed to process job ${job.id}: ${errorMsg}`);
        
        // Mark job as failed
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: errorMsg,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
      }

      // Add delay between jobs to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Step 4: Summary
    log('\n--- Summary ---');
    log(`Total jobs processed: ${results.processed}`);
    log(`Succeeded: ${results.succeeded}`);
    log(`Failed: ${results.failed}`);
    
    if (results.errors.length > 0) {
      log('\nErrors:');
      results.errors.forEach(err => log(`  - ${err}`));
    }

    // Step 5: Database stats
    const { data: trucks, count: truckCount } = await supabase
      .from('food_trucks')
      .select('*', { count: 'exact', head: true });
    
    const { data: jobStats } = await supabase
      .from('scraping_jobs')
      .select('status');
    
    const stats = jobStats?.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {}) || {};

    log('\n--- Database Status ---');
    log(`Total food trucks: ${truckCount}`);
    log(`Job status distribution:`);
    Object.entries(stats).forEach(([status, count]) => {
      log(`  - ${status}: ${count}`);
    });

    // Exit with appropriate code
    if (results.failed > 0 && results.succeeded === 0) {
      process.exit(1); // All failed
    } else if (results.failed > 0) {
      process.exit(0); // Some succeeded (partial success)
    } else {
      process.exit(0); // All succeeded
    }

  } catch (error) {
    log(`\n!!! Fatal error: ${error.message}`);
    log(error.stack);
    process.exit(1);
  }
}

// Run the scraper
main().catch(error => {
  log(`Unhandled error: ${error.message}`);
  process.exit(1);
});
