import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
/**
 * Get Web Vitals Analytics Data
 */
export function getRequestParams(request) {
    var _a;
    const { searchParams } = new URL(request.url);
    const days = Number.parseInt((_a = searchParams.get('days')) !== null && _a !== void 0 ? _a : '7', 10);
    const page = searchParams.get('page');
    return { days, page };
}
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
export async function fetchAndFilterMetrics(request) {
    const { days, page } = getRequestParams(request);
    if (!supabaseAdmin) {
        throw new Error('Database not available');
    }
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    let query = supabaseAdmin
        .from('web_vitals_metrics')
        .select('*')
        .gte('recorded_at', startDate.toISOString())
        .order('recorded_at', { ascending: false });
    if (page != undefined && page !== '') {
        query = query.ilike('page_url', `%${page}%`);
    }
    const { data: metrics, error } = await query.limit(1000);
    if (error) {
        throw error;
    }
    return { metrics: metrics !== null && metrics !== void 0 ? metrics : [], days, startDate };
}
/**
 * Calculate summary statistics for metrics
 */
export function calculateMetricsSummary(metrics) {
    const metricTypes = [
        'LCP',
        'FID',
        'CLS',
        'FCP',
        'TTFB',
    ];
    const summary = {};
    for (const metricName of metricTypes) {
        const metricData = metrics.filter((m) => m.metric_name === metricName);
        if (metricData.length === 0) {
            summary[metricName] = {
                count: 0,
                average: undefined,
                median: undefined,
                p75: undefined,
                p95: undefined,
                goodCount: 0,
                needsImprovementCount: 0,
                poorCount: 0,
            };
            continue;
        }
        const values = metricData.map((m) => m.metric_value).sort((a, b) => a - b);
        const ratings = metricData.map((m) => m.rating);
        summary[metricName] = {
            count: metricData.length,
            average: Math.round(values.reduce((sum, val) => sum + val, 0) / values.length),
            median: getPercentile(values, 50),
            p75: getPercentile(values, 75),
            p95: getPercentile(values, 95),
            goodCount: ratings.filter((r) => r === 'good').length,
            needsImprovementCount: ratings.filter((r) => r === 'needs-improvement').length,
            poorCount: ratings.filter((r) => r === 'poor').length,
        };
    }
    return summary;
}
/**
 * Calculate percentile value from sorted array
 */
export function getPercentile(sortedValues, percentile) {
    if (sortedValues.length === 0)
        return 0;
    const index = (percentile / 100) * (sortedValues.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) {
        return Math.round(sortedValues[lower]);
    }
    const weight = index - lower;
    return Math.round(sortedValues[lower] * (1 - weight) + sortedValues[upper] * weight);
}
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
export async function handlePostRequest(request) {
    try {
        const metric = await request.json();
        // Validate metric data
        if (typeof metric !== 'object' ||
            metric == undefined ||
            !('name' in metric) ||
            !('value' in metric) ||
            !('url' in metric) ||
            typeof metric.value !== 'number') {
            return NextResponse.json({ success: false, error: 'Invalid metric data' }, { status: 400 });
        }
        const validatedMetric = metric;
        if (supabaseAdmin) {
            try {
                const { error } = await supabaseAdmin.from('web_vitals_metrics').insert({
                    metric_name: validatedMetric.name,
                    metric_value: validatedMetric.value,
                    rating: validatedMetric.rating,
                    page_url: validatedMetric.url,
                    user_agent: validatedMetric.userAgent,
                    recorded_at: new Date(validatedMetric.timestamp).toISOString(),
                });
                if (error) {
                    console.warn('Failed to store web vital metric:', error);
                    // Don't fail the request - metrics collection should be non-blocking
                }
            }
            catch (dbError) {
                console.warn('Database error storing web vital:', dbError);
            }
        }
        // Log performance issues for monitoring
        if (validatedMetric.rating === 'poor') {
            console.warn(`Poor ${validatedMetric.name} performance detected:`, {
                value: validatedMetric.value,
                url: validatedMetric.url,
                timestamp: new Date(validatedMetric.timestamp).toISOString(),
            });
        }
        return NextResponse.json({ success: true });
    }
    catch (error) {
        console.error('Web vitals endpoint error:', error);
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
}
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
export async function handleGetRequest(request) {
    try {
        const { metrics, days, startDate } = await fetchAndFilterMetrics(request);
        const summary = calculateMetricsSummary(metrics);
        return NextResponse.json({
            success: true,
            data: {
                metrics,
                summary,
                period: {
                    days,
                    startDate: startDate.toISOString(),
                    endDate: new Date().toISOString(),
                },
            },
        });
    }
    catch (error) {
        console.error('Failed to fetch web vitals analytics:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch analytics data' }, { status: 500 });
    }
}
