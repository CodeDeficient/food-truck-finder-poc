import { NextResponse } from 'next/server';
import { ScrapingJobService, FoodTruckService } from '../../../../../../../lib/supabase.js';
import { logActivity } from '../../../../../../../lib/activityLogger.js';
import { DEFAULT_SCRAPE_URLS } from '../../../../../../../lib/config.js';
// Vercel hobby plan has 10 second timeout, leave some buffer
const FUNCTION_TIMEOUT_MS = 9000;
const PROCESSING_TIMEOUT_MS = 8000;
/**
 * Lightweight CRON handler that creates jobs but doesn't process them
 * This avoids timeout issues on Vercel hobby plan
 */
export async function handleAutoScrapeImproved(request) {
    const startTime = Date.now();
    try {
        // Verify authorization
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        logActivity({
            type: 'cron_job',
            action: 'auto_scrape_started',
            details: { timestamp: new Date().toISOString() },
        });
        const result = {
            trucksProcessed: 0,
            newTrucksFound: 0,
            errors: []
        };
        // Get URLs to scrape
        const urlsToScrape = await getUrlsToScrape();
        console.info(`Found ${urlsToScrape.length} URLs to process`);
        // Check existing trucks to determine which are new
        const { trucks: existingTrucks } = await FoodTruckService.getAllTrucks(1000, 0);
        const existingUrls = new Set(existingTrucks.flatMap(truck => truck.source_urls || []));
        // Create jobs for URLs (but don't process them)
        for (const url of urlsToScrape) {
            // Check if we're approaching timeout
            if (Date.now() - startTime > PROCESSING_TIMEOUT_MS) {
                console.warn('Approaching function timeout, stopping job creation');
                break;
            }
            try {
                const isNew = !existingUrls.has(url);
                // Check if job already exists
                const existingJobs = await ScrapingJobService.getJobsByStatus('all');
                const jobExists = existingJobs.some(job => job.target_url === url && ['pending', 'running'].includes(job.status));
                if (!jobExists) {
                    // Create job but don't process it
                    await ScrapingJobService.createJob({
                        job_type: 'website_auto',
                        target_url: url,
                        priority: isNew ? 10 : 5, // Higher priority for new trucks
                        scheduled_at: new Date().toISOString(),
                    });
                    result.trucksProcessed++;
                    if (isNew) {
                        result.newTrucksFound++;
                    }
                }
            }
            catch (error) {
                console.error(`Error creating job for ${url}:`, error);
                result.errors.push(url);
            }
        }
        // Process a few high-priority pending jobs if we have time
        const remainingTime = FUNCTION_TIMEOUT_MS - (Date.now() - startTime);
        if (remainingTime > 2000) {
            await processHighPriorityJobs(remainingTime - 1000);
        }
        logActivity({
            type: 'cron_job',
            action: 'auto_scrape_completed',
            details: {
                timestamp: new Date().toISOString(),
                trucksProcessed: result.trucksProcessed,
                newTrucksFound: result.newTrucksFound,
                errorsCount: result.errors.length,
            },
        });
        return NextResponse.json({
            success: true,
            message: 'Auto-scraping jobs created successfully',
            data: {
                trucksProcessed: result.trucksProcessed,
                newTrucksFound: result.newTrucksFound,
                timestamp: new Date().toISOString(),
                note: 'Jobs created but not processed. Use separate job processor to avoid timeouts.',
            },
        });
    }
    catch (error) {
        console.error('Auto-scraping cron job failed:', error);
        logActivity({
            type: 'cron_job',
            action: 'auto_scrape_failed',
            details: {
                timestamp: new Date().toISOString(),
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        });
        return NextResponse.json({
            success: false,
            error: 'Auto-scraping failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
async function getUrlsToScrape() {
    // This is a simplified version - in production, you'd also check discovered_urls table
    return DEFAULT_SCRAPE_URLS;
}
async function processHighPriorityJobs(timeLimit) {
    const startTime = Date.now();
    try {
        // Get high priority pending jobs
        const pendingJobs = await ScrapingJobService.getJobsByStatus('pending');
        const highPriorityJobs = pendingJobs
            .filter(job => job.priority >= 10)
            .sort((a, b) => b.priority - a.priority)
            .slice(0, 3); // Process at most 3 jobs
        for (const job of highPriorityJobs) {
            if (Date.now() - startTime > timeLimit) {
                break;
            }
            // Just update status to indicate it's been queued
            await ScrapingJobService.updateJobStatus(job.id, 'pending', {
                data_collected: {
                    ...job.data_collected,
                    queued_at: new Date().toISOString(),
                    queued_note: 'Queued for processing by job processor'
                }
            });
        }
    }
    catch (error) {
        console.error('Error processing high priority jobs:', error);
    }
}
