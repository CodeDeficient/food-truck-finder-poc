// lib/autoScraper.ts
import { DEFAULT_SCRAPE_URLS, DEFAULT_STALENESS_THRESHOLD_DAYS } from './config';
import { supabaseAdmin, FoodTruckService, ScrapingJobService } from './supabase'; // Assuming FoodTruckService and ScrapingJobService are exported from supabase
import { processScrapingJob } from '@/app/api/scrape/route'; // This import might be problematic due to its location and dependencies.

async function triggerScrapingProcess(url: string): Promise<{ success: boolean; jobId?: string; error?: string; message?: string }> {
  // Check for existing pending or running jobs for this URL to avoid duplicates
  const existingJobs = await ScrapingJobService.getJobsByStatus('all'); // Fetch all to check pending/running
  const pendingOrRunningJob = existingJobs.find(
    (job) => job.target_url === url && (job.status === 'pending' || job.status === 'running')
  );

  if (pendingOrRunningJob) {
    console.log(`AutoScraper: Job for ${url} is already pending or running (Job ID: ${pendingOrRunningJob.id}). Skipping.`);
    return { success: false, message: `Job for ${url} is already pending or running.` };
  }

  console.log(`AutoScraper: No pending/running job for ${url}. Creating new scrape job.`);
  try {
    const job = await ScrapingJobService.createJob({
      job_type: 'website_auto', // Differentiate auto-triggered jobs
      target_url: url,
      priority: 5, // Default priority
      scheduled_at: new Date().toISOString(),
    });

    // IMPORTANT: Directly calling processScrapingJob here.
    // This assumes processScrapingJob is self-contained or its dependencies are available.
    // This is a simplification. A more robust solution might involve an internal queue or API call.
    processScrapingJob(job.id);

    console.log(`AutoScraper: Successfully created and initiated processing for job ${job.id} for URL ${url}.`);
    return { success: true, jobId: job.id, message: `Scraping job created and processing initiated for ${url}.` };
  } catch (error) {
    console.error(`AutoScraper: Error creating/processing job for ${url}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create or process job' };
  }
}

export async function ensureDefaultTrucksAreScraped(): Promise<Array<{ url: string; status: string; details?: string; jobId?: string }>> {
  console.log('AutoScraper: Starting check for default trucks...');
  const results = [];

  for (const url of DEFAULT_SCRAPE_URLS) {
    try {
      console.log(`AutoScraper: Checking URL: ${url}`);
      // Check if a food truck from this source URL already exists
      // We need a way to query food_trucks by source_url.
      // FoodTruckService might not have this method. Let's query directly or add it.
      const { data: existingTrucks, error: truckQueryError } = await supabaseAdmin
        .from('food_trucks')
        .select('id, last_scraped_at, source_urls')
        .or(`source_urls.cs.{"${url}"}`) // Check if URL is in the source_urls array
        .limit(1);

      if (truckQueryError) {
        console.error(`AutoScraper: Error querying for existing truck for URL ${url}:`, truckQueryError.message);
        results.push({ url, status: 'error', details: `Supabase query error: ${truckQueryError.message}` });
        continue;
      }

      const truck = existingTrucks && existingTrucks.length > 0 ? existingTrucks[0] : null;

      if (truck) {
        console.log(`AutoScraper: Found existing truck for ${url} (ID: ${truck.id}). Last scraped: ${truck.last_scraped_at}`);
        const lastScrapedDate = new Date(truck.last_scraped_at);
        const stalenessLimit = new Date();
        stalenessLimit.setDate(stalenessLimit.getDate() - DEFAULT_STALENESS_THRESHOLD_DAYS);

        if (lastScrapedDate < stalenessLimit) {
          console.log(`AutoScraper: Data for ${url} is stale. Triggering re-scrape.`);
          const triggerResult = await triggerScrapingProcess(url);
          results.push({ url, status: triggerResult.success ? 're-scraping_triggered' : 'error', details: triggerResult.error || triggerResult.message, jobId: triggerResult.jobId });
        } else {
          console.log(`AutoScraper: Data for ${url} is fresh. No action needed.`);
          results.push({ url, status: 'fresh', details: `Last scraped at ${truck.last_scraped_at}` });
        }
      } else {
        console.log(`AutoScraper: No existing truck found for ${url}. Triggering initial scrape.`);
        const triggerResult = await triggerScrapingProcess(url);
        results.push({ url, status: triggerResult.success ? 'initial_scrape_triggered' : 'error', details: triggerResult.error || triggerResult.message, jobId: triggerResult.jobId });
      }
    } catch (e) {
      console.error(`AutoScraper: Unexpected error processing URL ${url}:`, e);
      results.push({ url, status: 'error', details: e instanceof Error ? e.message : 'Unknown error' });
    }
  }
  console.log('AutoScraper: Finished check for default trucks.');
  return results;
}

// Note on processScrapingJob import:
// The direct import of `processScrapingJob` from `@/app/api/scrape/route.ts` can be problematic
// if `route.ts` has side effects or dependencies not suitable for a library context (like NextRequest/Response).
// A cleaner way would be to refactor `processScrapingJob` into a shared utility if it's to be called directly,
// or for `triggerScrapingProcess` to make an internal HTTP POST request to `/api/scrape`.
// For this iteration, we are attempting direct call, assuming it's manageable.
