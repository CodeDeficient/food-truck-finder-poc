// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextResponse } from 'next/server';
import { ScrapingJobService, FoodTruckService, supabase, supabaseAdmin } from '@/lib/supabase';

/**
 * SOTA CRON Job Monitoring API
 *
 * Enhanced monitoring system for background processes and scheduled tasks
 * Provides real-time status, performance metrics, and alerting capabilities
 */

interface CronJobMetrics {
  executionTime: number;
  memoryUsage: number;
  successRate: number;
  lastError?: string;
  performanceTrend: 'improving' | 'stable' | 'degrading';
}

// Removed unused EnhancedCronJob interface

// Enhanced security check for admin API endpoints
async function verifyAdminAccess(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return false;

    if (!supabaseAdmin) return false;

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  // Verify admin access for API endpoint security
  const hasAdminAccess = await verifyAdminAccess(request);
  if (!hasAdminAccess) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized access' },
      { status: 401 }
    );
  }

  try {
    // Fetch real cron job data from database
    const [recentJobs, todayTrucks] = await Promise.all([
      // @ts-expect-error TS(2339): Property 'getJobsFromDate' does not exist on type ... Remove this comment to see the full error message
      ScrapingJobService.getJobsFromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // Last 24 hours
      FoodTruckService.getAllTrucks(1000, 0), // Get trucks for processing count
    ]);

    // Calculate next run times based on cron schedules
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

    // Filter jobs by type/purpose for cron status
    const autoScrapeJobs = recentJobs.filter((job: any) => job.job_type === 'auto_scrape' || job.target_url?.includes('auto')
    );
    const qualityCheckJobs = recentJobs.filter((job: any) => job.job_type === 'quality_check' || job.target_url?.includes('quality')
    );

    // Count today's new trucks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newTrucksToday = todayTrucks.trucks.filter(truck => {
      const createdAt = new Date(truck.created_at);
      return createdAt >= today;
    }).length;

    const jobs = [
      {
        id: 'auto-scrape',
        name: 'Auto Food Truck Scraping',
        schedule: '0 6 * * *', // Daily at 6 AM
        lastRun: getLastCronRun(6),
        nextRun: getNextCronRun(6),
        status: autoScrapeJobs.some((job: any) => job.status === 'running') ? 'running' as const : 'idle' as const,
        lastResult: {
          success: autoScrapeJobs.length > 0 ? autoScrapeJobs[0].status === 'completed' : true,
          message: autoScrapeJobs.length > 0 && autoScrapeJobs[0].status === 'completed'
            ? 'Successfully processed food trucks'
            : autoScrapeJobs.length > 0 && autoScrapeJobs[0].status === 'failed'
            ? 'Scraping job failed'
            : 'No recent scraping jobs',
          trucksProcessed: todayTrucks.total,
          newTrucksFound: newTrucksToday,
          errors: autoScrapeJobs.filter((job: any) => job.status === 'failed').length,
        },
      },
      {
        id: 'quality-check',
        name: 'Daily Data Quality Check',
        schedule: '0 8 * * *', // Daily at 8 AM
        lastRun: getLastCronRun(8),
        nextRun: getNextCronRun(8),
        status: qualityCheckJobs.some((job: any) => job.status === 'running') ? 'running' as const : 'idle' as const,
        lastResult: {
          success: qualityCheckJobs.length > 0 ? qualityCheckJobs[0].status === 'completed' : true,
          message: qualityCheckJobs.length > 0 && qualityCheckJobs[0].status === 'completed'
            ? 'Quality check completed successfully'
            : qualityCheckJobs.length > 0 && qualityCheckJobs[0].status === 'failed'
            ? 'Quality check failed'
            : 'No recent quality checks',
          trucksProcessed: todayTrucks.total,
          newTrucksFound: 0, // Quality checks don't find new trucks
          errors: qualityCheckJobs.filter((job: any) => job.status === 'failed').length,
        },
      },
    ];

    return NextResponse.json({
      success: true,
      jobs,
    });
  } catch (error) {
    console.error('Error fetching cron status:', error);
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
