import { NextResponse } from 'next/server';
import { ScrapingJobService, FoodTruckService } from '@/lib/supabase';
export async function handleGetRequest() {
    const metrics = await getScrapingMetrics();
    return NextResponse.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString(),
    });
}
/**
 * Retrieves real-time scraping metrics from the database.
 * @example
 * getScrapingMetrics().then(metrics => console.log(metrics))
 * // { scrapingJobs: {...}, dataQuality: {...}, systemHealth: {...} }
 * @returns {Promise<RealtimeMetrics>} A promise that resolves to an object containing scraping job metrics, data quality information, and system health stats.
 * @description
 *   - Fetches data from ScrapingJobService and FoodTruckService to compute metrics.
 *   - Placeholder values are used for averageScore and recentChanges in dataQuality.
 *   - Computes the number of jobs by their status: running, completed, failed, and pending.
 */
async function getScrapingMetrics() {
    // Fetch real scraping metrics from database
    const [allJobsResult, recentTrucksResult] = await Promise.all([
        ScrapingJobService.getAllJobs(100, 0), // Get last 100 jobs for metrics
        FoodTruckService.getAllTrucks(1000, 0), // Get trucks for processing count
    ]);
    // Type guard for allJobsResult
    const allJobs = Array.isArray(allJobsResult) ? allJobsResult : [];
    const recentTrucks = typeof recentTrucksResult === 'object' &&
        'trucks' in recentTrucksResult &&
        Array.isArray(recentTrucksResult.trucks)
        ? recentTrucksResult
        : { trucks: [], total: 0 };
    const typedJobs = allJobs;
    const successfulRuns = typedJobs.filter((job) => job.status === 'completed').length;
    const failedRuns = typedJobs.filter((job) => job.status === 'failed').length;
    return {
        scrapingJobs: {
            active: typedJobs.filter((job) => job.status === 'running').length,
            completed: successfulRuns,
            failed: failedRuns,
            pending: typedJobs.filter((job) => job.status === 'pending').length,
        },
        dataQuality: {
            averageScore: 0, // Placeholder, actual calculation might be complex
            totalTrucks: recentTrucks.total,
            recentChanges: 0, // Placeholder
        },
        systemHealth: {
            status: 'healthy',
            uptime: process.uptime(),
            lastUpdate: new Date().toISOString(),
        },
    };
}
