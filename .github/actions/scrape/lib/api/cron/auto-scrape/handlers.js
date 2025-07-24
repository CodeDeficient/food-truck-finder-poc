import { NextResponse } from 'next/server';
import { autoScraper } from '../../../../../../../lib/autoScraper.js';
import { scheduler } from '../../../../../../../lib/scheduler.js';
import { logActivity } from '../../../../../../../lib/activityLogger.js';
/**
* Verifies the cron secret authorization header against a stored environment variable.
* @example
* verifyCronSecret(request)
* NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
* @param {NextRequest} request - The incoming request object containing headers.
* @returns {NextResponse | null} Returns an error response if authorization fails or if the secret is not set.
* @description
*   - Logs an error message if the CRON_SECRET environment variable is not configured or is empty.
*   - Logs unauthorized attempts, including the provided authorization header value.
*   - Relies on the Bearer token scheme for authorization.
*/
function verifyCronSecret(request) {
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
function logAutoScrapeStart() {
    console.info('Starting automated scraping job...');
    logActivity({
        type: 'cron_job',
        action: 'auto_scrape_started',
        details: { timestamp: new Date().toISOString() },
    });
}
/**
 * Logs the completion of an automated scraping job with pertinent details.
 * @example
 * logAutoScrapeCompletion(autoScrapeResult)
 * Automated scraping job completed successfully
 * @param {AutoScrapeResult} result - The result object containing details of the scraping job.
 * @returns {void} Does not return a value.
 * @description
 *   - Logs activity including the number of trucks processed and found, as well as any errors encountered.
 *   - Utilizes a standardized logActivity function to record job completion.
 *   - Converts the current timestamp to an ISO string format.
 *   - Provides a console message indicating successful job completion.
 */
function logAutoScrapeCompletion(result) {
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
function logAutoScrapeFailure(error) {
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
export async function handlePostRequest(request) {
    try {
        const authResponse = verifyCronSecret(request);
        if (authResponse) {
            return authResponse;
        }
        logAutoScrapeStart();
        const rawResult = await autoScraper.runAutoScraping();
        // Map errors to string[] for compatibility
        const result = {
            trucksProcessed: rawResult.trucksProcessed,
            newTrucksFound: rawResult.newTrucksFound,
            errors: rawResult.errors?.map((e) => e.url + (e.details ? `: ${e.details}` : '')),
        };
        scheduler.scheduleFollowUpTasks(result);
        logAutoScrapeCompletion(result);
        return NextResponse.json({
            success: true,
            message: 'Auto-scraping completed successfully',
            data: {
                trucksProcessed: result.trucksProcessed,
                newTrucksFound: result.newTrucksFound,
                timestamp: new Date().toISOString(),
            },
        });
    }
    catch (error) {
        logAutoScrapeFailure(error);
        return NextResponse.json({
            success: false,
            error: 'Auto-scraping failed',
            message: error instanceof Error ? error.message : 'Unknown error',
        }, { status: 500 });
    }
}
export function handleGetRequest() {
    return NextResponse.json({ error: 'Method not allowed. Use POST for cron jobs.' }, { status: 405 });
}
