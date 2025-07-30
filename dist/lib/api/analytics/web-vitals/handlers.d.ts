import { NextRequest, NextResponse } from 'next/server';
/**
 * Get Web Vitals Analytics Data
 */
export declare function getRequestParams(request: NextRequest): {
    days: number;
    page: string | null;
};
/**
 * Fetches and filters web vital metrics based on the given request parameters.
 * @example
 * fetchAndFilterMetrics(request)
 * { metrics: [{...}], days: 7, startDate: 2023-01-01T00:00:00.000Z }
 * @param {NextRequest} request - The request object containing parameters for filtering metrics such as days and page.
 * @returns {Object} An object containing an array of metrics, the number of days for the range, and the start date.
 * @description
 *   - Throws an error if the Supabase database connection is not available.
 *   - Builds a query to select metrics recorded after a specific start date.
 *   - Filters metrics by page URL if specified in the request parameters.
 *   - Limits the number of returned metrics to 1000 to avoid overwhelming the client.
 */
export declare function fetchAndFilterMetrics(request: NextRequest): Promise<{
    metrics: any[];
    days: number;
    startDate: Date;
}>;
/**
 * Calculate summary statistics for metrics
 */
export declare function calculateMetricsSummary(metrics: {
    metric_name: string;
    metric_value: number;
    rating: string;
}[]): Record<string, {
    count: number;
    average: number | undefined;
    median: number | undefined;
    p75: number | undefined;
    p95: number | undefined;
    goodCount: number;
    needsImprovementCount: number;
    poorCount: number;
}>;
/**
 * Calculate percentile value from sorted array
 */
export declare function getPercentile(sortedValues: number[], percentile: number): number;
/**
 * Handles POST requests to store and validate web vital metrics.
 * @example
 * handlePostRequest(request)
 * { success: true }
 * @param {NextRequest} request - The incoming request containing the web vital metric data.
 * @returns {NextResponse} JSON response indicating success or failure of storing the metric.
 * @description
 *   - Validates that the metric contains required fields and checks the types of values.
 *   - Stores validated metrics in a Supabase table if `supabaseAdmin` is available.
 *   - Logs any 'poor' performance metrics for monitoring purposes.
 *   - Ensures metrics collection is non-blocking, even if an error occurs during database operations.
 */
export declare function handlePostRequest(request: NextRequest): Promise<NextResponse<{
    success: boolean;
}>>;
/**
* Handles a GET request to fetch web vitals analytics data, process it, and respond with a summary.
* @example
* handleGetRequest(request)
* { success: true, data: { metrics: [...], summary: {...}, period: {...} } }
* @param {NextRequest} request - The incoming request object containing the necessary parameters.
* @returns {Promise<NextResponse>} Returns a JSON response indicating success or failure along with the data.
* @description
*   - Fetches metrics which are filtered and evaluated from the request data.
*   - Constructs a summary of the metrics including names, values, and ratings.
*   - Generates a response containing the metrics, summary, and calculated time period.
*   - Logs errors and responses with a status code in case of failure during data fetching.
*/
export declare function handleGetRequest(request: NextRequest): Promise<NextResponse<{
    success: boolean;
    data: {
        metrics: any[];
        summary: Record<string, {
            count: number;
            average: number | undefined;
            median: number | undefined;
            p75: number | undefined;
            p95: number | undefined;
            goodCount: number;
            needsImprovementCount: number;
            poorCount: number;
        }>;
        period: {
            days: number;
            startDate: string;
            endDate: string;
        };
    };
}> | NextResponse<{
    success: boolean;
    error: string;
}>>;
