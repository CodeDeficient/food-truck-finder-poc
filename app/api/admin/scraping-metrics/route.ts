// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { NextResponse } from 'next/server';
import { ScrapingJobService, FoodTruckService, supabase } from '@/lib/supabase';

// Security check for admin API endpoints
async function verifyAdminAccess(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader) return false;

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) return false;

    const { data: profile } = await supabase
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
    // Fetch real scraping metrics from database
    const [allJobs, todayJobs, recentTrucks] = await Promise.all([
      // @ts-expect-error TS(2339): Property 'getAllJobs' does not exist on type '{ cr... Remove this comment to see the full error message
      ScrapingJobService.getAllJobs(100, 0), // Get last 100 jobs for metrics
      // @ts-expect-error TS(2339): Property 'getJobsFromDate' does not exist on type ... Remove this comment to see the full error message
      ScrapingJobService.getJobsFromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // Last 24 hours
      FoodTruckService.getAllTrucks(1000, 0), // Get trucks for processing count
    ]);

    const totalRuns = allJobs.length;
    const successfulRuns = allJobs.filter((job: any) => job.status === 'completed').length;
    const failedRuns = allJobs.filter((job: any) => job.status === 'failed').length;

    // Calculate average run time from completed jobs
    const completedJobs = allJobs.filter((job: any) => job.status === 'completed' && job.started_at && job.completed_at
    );

    const averageRunTime = completedJobs.length > 0
      ? Math.round(
          completedJobs.reduce((sum: any, job: any) => {
            const start = new Date(job.started_at).getTime();
            const end = new Date(job.completed_at).getTime();
            return sum + (end - start) / 1000; // Convert to seconds
          }, 0) / completedJobs.length
        )
      : 0;

    // Count trucks processed today and new trucks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newTrucksToday = recentTrucks.trucks.filter(truck => {
      const createdAt = new Date(truck.created_at);
      return createdAt >= today;
    }).length;

    const metrics = {
      totalRuns,
      successfulRuns,
      failedRuns,
      averageRunTime,
      totalTrucksProcessed: recentTrucks.total,
      newTrucksToday,
    };

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error('Error fetching scraping metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch scraping metrics',
        metrics: undefined,
      },
      { status: 500 },
    );
  }
}
