import { NextResponse } from 'next/server';
import { ScrapingJobService, FoodTruckService, supabase } from '@/lib/supabase';

// Security check for admin API endpoints
async function verifyAdminAccess(request: Request): Promise<boolean> {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader == undefined) return false;

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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const [allJobs, , recentTrucks] = await Promise.all([
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ScrapingJobService.getAllJobs(100, 0), // Get last 100 jobs for metrics
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      ScrapingJobService.getJobsFromDate(new Date(Date.now() - 24 * 60 * 60 * 1000)), // Last 24 hours (unused but kept for potential future use)
      FoodTruckService.getAllTrucks(1000, 0), // Get trucks for processing count
    ]);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const totalRuns = allJobs.length;
    const typedJobs = allJobs as Array<{ status?: string; started_at?: string; completed_at?: string }>;
    const successfulRuns = typedJobs.filter(job => job.status === 'completed').length;
    const failedRuns = typedJobs.filter(job => job.status === 'failed').length;

    // Calculate average run time from completed jobs
    const completedJobs = typedJobs.filter(job =>
      job.status === 'completed' && job.started_at !== undefined && job.completed_at !== undefined
    );

    let totalRunTime = 0;
    for (const job of completedJobs) {
      const start = new Date(job.started_at ?? '').getTime();
      const end = new Date(job.completed_at ?? '').getTime();
      totalRunTime += (end - start) / 1000; // Convert to seconds
    }

    const averageRunTime = completedJobs.length > 0
      ? Math.round(totalRunTime / completedJobs.length)
      : 0;

    // Count trucks processed today and new trucks
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const typedTrucks = recentTrucks.trucks as Array<{ created_at: string }>;
    const newTrucksToday = typedTrucks.filter(truck => {
      const createdAt = new Date(truck.created_at);
      return createdAt >= today;
    }).length;

    const metrics = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      totalRuns,
      successfulRuns,
      failedRuns,
      averageRunTime,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      totalTrucksProcessed: recentTrucks.total,
      newTrucksToday,
    };

    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: unknown) {
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
