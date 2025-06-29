import { NextResponse } from 'next/server';
import { ScrapingJobService, FoodTruckService, supabase } from '@/lib/supabase';
import { RealtimeMetrics } from './types';

export async function verifyAdminAccess(request: Request): Promise<boolean> {
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

export async function handleGetRequest(): Promise<NextResponse> {
  const metrics = await getScrapingMetrics();
  return NextResponse.json({
    success: true,
    data: metrics,
    timestamp: new Date().toISOString()
  });
}

function calculateJobStats(typedJobs: Array<{ status?: string; started_at?: string; completed_at?: string }>) {
  const successfulRuns = typedJobs.filter(job => job.status === 'completed').length;
  const failedRuns = typedJobs.filter(job => job.status === 'failed').length;
  const activeJobs = typedJobs.filter(job => job.status === 'running').length;
  const pendingJobs = typedJobs.filter(job => job.status === 'pending').length;

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

  return { successfulRuns, failedRuns, averageRunTime, activeJobs, pendingJobs };
}

function calculateNewTrucksToday(trucks: Array<{ created_at: string }>) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return trucks.filter(truck => {
    const createdAt = new Date(truck.created_at);
    return createdAt >= today;
  }).length;
}

async function getScrapingMetrics(): Promise<RealtimeMetrics> {
  // Fetch real scraping metrics from database
  const [allJobs, recentTrucks] = await Promise.all([
    ScrapingJobService.getAllJobs(100, 0), // Get last 100 jobs for metrics
    FoodTruckService.getAllTrucks(1000, 0), // Get trucks for processing count
  ]);

  // const totalRuns = allJobs.length; // Unused variable
  const typedJobs = allJobs as Array<{ status?: string; started_at?: string; completed_at?: string }>;

  const { successfulRuns, failedRuns, /* averageRunTime, */ activeJobs, pendingJobs } = calculateJobStats(typedJobs); // averageRunTime is unused by the return object
  // const newTrucksToday = calculateNewTrucksToday(recentTrucks.trucks as Array<{ created_at: string }>); // Unused variable

  return {
    scrapingJobs: {
      active: activeJobs,
      completed: successfulRuns,
      failed: failedRuns,
      pending: pendingJobs,
    },
    dataQuality: {
      averageScore: 0, // Placeholder, actual calculation might be complex
      totalTrucks: recentTrucks.total, // This remains from the direct fetch
      recentChanges: 0, // Placeholder
    },
    systemHealth: {
      status: 'healthy',
      uptime: process.uptime(),
      lastUpdate: new Date().toISOString(),
    },
  };
}
