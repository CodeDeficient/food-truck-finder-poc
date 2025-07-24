import { NextRequest, NextResponse } from 'next/server';
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
export declare function handlePostRequest(request: NextRequest): Promise<NextResponse<unknown>>;
export declare function handleGetRequest(): NextResponse<{
    error: string;
}>;
