import { NextRequest, NextResponse } from 'next/server';
import { autoScraper } from '@/lib/autoScraper';
import { scheduler } from '@/lib/scheduler';
import type { AutoScrapeResult } from './types.js';
import {
  verifyCronSecret,
  logAutoScrapeStart,
  createAutoScrapeSuccessResponse,
  createAutoScrapeErrorResponse,
} from './shared-handlers.js';

/**
 * Handles a POST request to initiate an auto-scraping process and returns the result.
 * @example
 * handlePostRequest(request)
 * { success: true, message: 'Auto-scraping completed successfully', data: { trucksProcessed: 10, newTrucksFound: 2, timestamp: '2023-08-23T18:25:43.511Z' } }
 * @param {NextRequest} request - The request object containing necessary parameters and headers for processing.
 * @returns {NextResponse} JSON response with either the success data or an error message.
 * @description
 *   - Validates request with a secret key before processing.
 *   - Logs scraping start and completion along with processed results.
 *   - Schedules follow-up tasks after successful scraping.
 *   - Catches and logs errors with a failure response in case of any exceptions during the process.
 */
export async function handlePostRequest(request: NextRequest) {
  try {
    const authResponse = verifyCronSecret(request);
    if (authResponse) {
      return authResponse;
    }

    logAutoScrapeStart();

    const rawResult = await autoScraper.runAutoScraping();
    // Map errors to string[] for compatibility
    const result: AutoScrapeResult = {
      trucksProcessed: rawResult.trucksProcessed,
      newTrucksFound: rawResult.newTrucksFound,
      errors: rawResult.errors?.map((e) => e.url + (e.details ? `: ${e.details}` : '')),
    };
    scheduler.scheduleFollowUpTasks(result);

    return createAutoScrapeSuccessResponse(result, 'Auto-scraping completed successfully');
  } catch (error) {
    return createAutoScrapeErrorResponse(error);
  }
}

export function handleGetRequest() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST for cron jobs.' },
    { status: 405 },
  );
}
