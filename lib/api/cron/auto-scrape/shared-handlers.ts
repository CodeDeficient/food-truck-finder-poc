import { NextRequest, NextResponse } from 'next/server';
import { logActivity } from '@/lib/activityLogger';

/**
 * Common interface for auto-scrape processing results
 */
export interface AutoScrapeResult {
  trucksProcessed: number;
  newTrucksFound: number;
  errors?: string[];
}

/**
 * Verifies the cron secret authorization header against a stored environment variable.
 * @param request - The incoming request object containing headers
 * @returns Error response if authorization fails, null if successful
 */
export function verifyCronSecret(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret === undefined || cronSecret === '') {
    console.error('CRON_SECRET not configured');
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    console.error('Unauthorized cron attempt:', authHeader);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  return null;
}

/**
 * Logs the start of an automated scraping job
 */
export function logAutoScrapeStart(): void {
  console.info('Starting automated scraping job...');
  logActivity({
    type: 'cron_job',
    action: 'auto_scrape_started',
    details: { timestamp: new Date().toISOString() },
  });
}

/**
 * Logs the completion of an automated scraping job with results
 * @param result - The result object containing details of the scraping job
 */
export function logAutoScrapeCompletion(result: AutoScrapeResult): void {
  logActivity({
    type: 'cron_job',
    action: 'auto_scrape_completed',
    details: {
      timestamp: new Date().toISOString(),
      trucksProcessed: result.trucksProcessed,
      newTrucksFound: result.newTrucksFound,
      errorsCount: result.errors?.length ?? 0,
    },
  });
  console.info('Automated scraping job completed successfully');
}

/**
 * Logs the failure of an automated scraping job
 * @param error - The error that occurred during scraping
 */
export function logAutoScrapeFailure(error: unknown): void {
  console.error('Auto-scraping cron job failed:', error);
  logActivity({
    type: 'cron_job',
    action: 'auto_scrape_failed',
    details: {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
    },
  });
}

/**
 * Creates a standardized error response for auto-scrape failures
 * @param error - The error that occurred
 * @returns NextResponse with error details
 */
export function createAutoScrapeErrorResponse(error: unknown): NextResponse {
  logAutoScrapeFailure(error);
  return NextResponse.json(
    {
      success: false,
      error: 'Auto-scraping failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    },
    { status: 500 }
  );
}

/**
 * Creates a standardized success response for auto-scrape completion
 * @param result - The processing result
 * @param customMessage - Optional custom success message
 * @returns NextResponse with success details
 */
export function createAutoScrapeSuccessResponse(
  result: AutoScrapeResult, 
  customMessage?: string
): NextResponse {
  logAutoScrapeCompletion(result);
  
  return NextResponse.json({
    success: true,
    message: customMessage || 'Auto-scraping completed successfully',
    data: {
      trucksProcessed: result.trucksProcessed,
      newTrucksFound: result.newTrucksFound,
      timestamp: new Date().toISOString(),
    },
  });
}
