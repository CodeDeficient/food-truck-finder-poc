import { NextResponse } from 'next/server';
import { ScrapingJobService, FoodTruckService } from '@/lib/supabase';
import { verifyAdminAccess } from '@/lib/auth/authHelpers';
// Helper function to calculate cron schedule times
function createCronTimeHelpers() {
    const now = new Date();
    const getNextCronRun = (hour) => {
        const next = new Date(now);
        next.setHours(hour, 0, 0, 0);
        if (next <= now) {
            next.setDate(next.getDate() + 1);
        }
        return next.toISOString();
    };
    const getLastCronRun = (hour) => {
        const last = new Date(now);
        last.setHours(hour, 0, 0, 0);
        if (last > now) {
            last.setDate(last.getDate() - 1);
        }
        return last.toISOString();
    };
    return { getNextCronRun, getLastCronRun };
}
// Helper function to fetch and process job data
async function fetchJobData() {
    let recentJobs = [];
    let todayTrucks = { trucks: [], total: 0 };
    try {
        const recentJobsRaw = await ScrapingJobService.getJobsFromDate(new Date(Date.now() - 24 * 60 * 60 * 1000));
        recentJobs = Array.isArray(recentJobsRaw) ? recentJobsRaw : [];
    }
    catch (error) {
        console.warn('Failed to fetch recent jobs:', error);
    }
    try {
        const todayTrucksRaw = await FoodTruckService.getAllTrucks(1000, 0);
        todayTrucks = todayTrucksRaw;
    }
    catch (error) {
        console.warn('Failed to fetch trucks:', error);
    }
    return { recentJobs, todayTrucks };
}
// Helper function to filter jobs by type
function filterJobsByType(recentJobs) {
    const autoScrapeJobs = recentJobs.filter((job) => {
        var _a, _b;
        return job.job_type === 'auto_scrape' || ((_b = (_a = job.target_url) === null || _a === void 0 ? void 0 : _a.includes('auto')) !== null && _b !== void 0 ? _b : false);
    });
    const qualityCheckJobs = recentJobs.filter((job) => {
        var _a, _b;
        return job.job_type === 'quality_check' || ((_b = (_a = job.target_url) === null || _a === void 0 ? void 0 : _a.includes('quality')) !== null && _b !== void 0 ? _b : false);
    });
    return { autoScrapeJobs, qualityCheckJobs };
}
// Helper function to count new trucks today
function countNewTrucksToday(todayTrucks) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return todayTrucks.trucks.filter((truck) => {
        const createdAt = new Date(truck.created_at);
        return createdAt >= today;
    }).length;
}
// Helper function to create job result object
function createJobResult(jobs, todayTrucks, newTrucksToday, isQualityCheck = false) {
    const firstJob = jobs[0];
    const hasJobs = jobs.length > 0;
    const isCompleted = hasJobs && (firstJob === null || firstJob === void 0 ? void 0 : firstJob.status) === 'completed';
    const isFailed = hasJobs && (firstJob === null || firstJob === void 0 ? void 0 : firstJob.status) === 'failed';
    let message;
    if (isCompleted) {
        message = isQualityCheck
            ? 'Quality check completed successfully'
            : 'Successfully processed food trucks';
    }
    else if (isFailed) {
        message = isQualityCheck ? 'Quality check failed' : 'Scraping job failed';
    }
    else {
        message = isQualityCheck ? 'No recent quality checks' : 'No recent scraping jobs';
    }
    return {
        success: hasJobs ? (firstJob === null || firstJob === void 0 ? void 0 : firstJob.status) === 'completed' : true,
        message,
        trucksProcessed: todayTrucks.total,
        newTrucksFound: isQualityCheck ? 0 : newTrucksToday,
        errors: jobs.filter((job) => job.status === 'failed').length,
    };
}
// Helper function to create cron jobs array
function createCronJobs(params) {
    const { autoScrapeJobs, qualityCheckJobs, todayTrucks, newTrucksToday, getLastCronRun, getNextCronRun, } = params;
    return [
        {
            id: 'auto-scrape',
            name: 'Auto Food Truck Scraping',
            schedule: '0 6 * * *', // Daily at 6 AM
            lastRun: getLastCronRun(6),
            nextRun: getNextCronRun(6),
            status: Boolean(autoScrapeJobs.some((job) => {
                return job.status === 'running';
            }))
                ? 'running'
                : 'idle',
            lastResult: createJobResult(autoScrapeJobs, todayTrucks, newTrucksToday, false),
        },
        {
            id: 'quality-check',
            name: 'Daily Data Quality Check',
            schedule: '0 8 * * *', // Daily at 8 AM
            lastRun: getLastCronRun(8),
            nextRun: getNextCronRun(8),
            status: Boolean(qualityCheckJobs.some((job) => {
                return job.status === 'running';
            }))
                ? 'running'
                : 'idle',
            lastResult: createJobResult(qualityCheckJobs, todayTrucks, newTrucksToday, true),
        },
    ];
}
export async function GET(request) {
    // Verify admin access for API endpoint security
    const hasAdminAccess = await verifyAdminAccess(request);
    if (!hasAdminAccess) {
        return NextResponse.json({ success: false, error: 'Unauthorized access' }, { status: 401 });
    }
    try {
        // Fetch job data using helper function
        const { recentJobs, todayTrucks } = await fetchJobData();
        // Get cron time calculation helpers
        const { getNextCronRun, getLastCronRun } = createCronTimeHelpers();
        // Filter jobs by type
        const { autoScrapeJobs, qualityCheckJobs } = filterJobsByType(recentJobs);
        // Count new trucks today
        const newTrucksToday = countNewTrucksToday(todayTrucks);
        // Create jobs array using helper function
        const jobs = createCronJobs({
            autoScrapeJobs,
            qualityCheckJobs,
            todayTrucks,
            newTrucksToday,
            getLastCronRun,
            getNextCronRun,
        });
        return NextResponse.json({
            success: true,
            jobs,
        });
    }
    catch (error) {
        console.error('Error fetching cron status:', error instanceof Error ? error.message : String(error));
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch cron status',
            jobs: [],
        }, { status: 500 });
    }
}
