import { NextResponse } from 'next/server';
import { ScrapingJobService, FoodTruckService } from '@/lib/supabase';

import { verifyAdminAccess } from '@/lib/auth/authHelpers';

/**
 * SOTA CRON Job Monitoring API
 *
 * Enhanced monitoring system for background processes and scheduled tasks
 * Provides real-time status, performance metrics, and alerting capabilities
 */

// Type definitions for job data
interface JobData {
  job_type?: string;
  target_url?: string;
  status?: string;
  created_at?: string;
}

interface TruckData {
  created_at: string;
}

interface TrucksResponse {
  trucks: TruckData[];
  total: number;
}

// Helper function to calculate cron schedule times
function createCronTimeHelpers() {
  const now = new Date();

  const getNextCronRun = (hour: number) => {
    const next = new Date(now);
    next.setHours(hour, 0, 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
    return next.toISOString();
  };

  const getLastCronRun = (hour: number) => {
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
async function fetchJobData(): Promise<{ recentJobs: JobData[]; todayTrucks: TrucksResponse }> {
  let recentJobs: JobData[] = [];
  let todayTrucks: TrucksResponse = { trucks: [], total: 0 };

  try {
    const recentJobsRaw = await ScrapingJobService.getJobsFromDate(
      new Date(Date.now() - 24 * 60 * 60 * 1000),
    );
    recentJobs = Array.isArray(recentJobsRaw) ? (recentJobsRaw as JobData[]) : [];
  } catch (error: unknown) {
    console.warn('Failed to fetch recent jobs:', error);
  }

  try {
    const todayTrucksRaw = await FoodTruckService.getAllTrucks(1000, 0);
    todayTrucks = todayTrucksRaw as TrucksResponse;
  } catch (error: unknown) {
    console.warn('Failed to fetch trucks:', error);
  }

  return { recentJobs, todayTrucks };
}

// Helper function to filter jobs by type
function filterJobsByType(recentJobs: JobData[]) {
  const autoScrapeJobs = recentJobs.filter((job: JobData) => {
    return job.job_type === 'auto_scrape' || (job.target_url?.includes('auto') ?? false);
  });

  const qualityCheckJobs = recentJobs.filter((job: JobData) => {
    return job.job_type === 'quality_check' || (job.target_url?.includes('quality') ?? false);
  });

  return { autoScrapeJobs, qualityCheckJobs };
}

// Helper function to count new trucks today
function countNewTrucksToday(todayTrucks: TrucksResponse): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return todayTrucks.trucks.filter((truck: TruckData) => {
    const createdAt = new Date(truck.created_at);
    return createdAt >= today;
  }).length;
}

// Helper function to create job result object
function createJobResult(
  jobs: JobData[],
  todayTrucks: TrucksResponse,
  newTrucksToday: number,
  isQualityCheck = false,
) {
  const firstJob = jobs[0];
  const hasJobs = jobs.length > 0;
  const isCompleted = hasJobs && firstJob?.status === 'completed';
  const isFailed = hasJobs && firstJob?.status === 'failed';

  let message: string;
  if (isCompleted) {
    message = isQualityCheck
      ? 'Quality check completed successfully'
      : 'Successfully processed food trucks';
  } else if (isFailed) {
    message = isQualityCheck ? 'Quality check failed' : 'Scraping job failed';
  } else {
    message = isQualityCheck ? 'No recent quality checks' : 'No recent scraping jobs';
  }

  return {
    success: hasJobs ? firstJob?.status === 'completed' : true,
    message,
    trucksProcessed: todayTrucks.total,
    newTrucksFound: isQualityCheck ? 0 : newTrucksToday,
    errors: jobs.filter((job: JobData) => job.status === 'failed').length,
  };
}

// Helper function to create cron jobs array
function createCronJobs(params: {
  autoScrapeJobs: JobData[];
  qualityCheckJobs: JobData[];
  todayTrucks: TrucksResponse;
  newTrucksToday: number;
  getLastCronRun: (hour: number) => string;
  getNextCronRun: (hour: number) => string;
}) {
  const {
    autoScrapeJobs,
    qualityCheckJobs,
    todayTrucks,
    newTrucksToday,
    getLastCronRun,
    getNextCronRun,
  } = params;

  return [
    {
      id: 'auto-scrape',
      name: 'Auto Food Truck Scraping',
      schedule: '0 6 * * *', // Daily at 6 AM
      lastRun: getLastCronRun(6),
      nextRun: getNextCronRun(6),
      status: Boolean(
        autoScrapeJobs.some((job: JobData) => {
          return job.status === 'running';
        }),
      )
        ? ('running' as const)
        : ('idle' as const),
      lastResult: createJobResult(autoScrapeJobs, todayTrucks, newTrucksToday, false),
    },
    {
      id: 'quality-check',
      name: 'Daily Data Quality Check',
      schedule: '0 8 * * *', // Daily at 8 AM
      lastRun: getLastCronRun(8),
      nextRun: getNextCronRun(8),
      status: Boolean(
        qualityCheckJobs.some((job: JobData) => {
          return job.status === 'running';
        }),
      )
        ? ('running' as const)
        : ('idle' as const),
      lastResult: createJobResult(qualityCheckJobs, todayTrucks, newTrucksToday, true),
    },
  ];
}

export async function GET(request: Request) {
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
  } catch (error: unknown) {
    console.error('Error fetching cron status:', error instanceof Error ? error.message : String(error));
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch cron status',
        jobs: [],
      },
      { status: 500 },
    );
  }
}
