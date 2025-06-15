import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FoodTruckService,
  ScrapingJobService,
  DataProcessingService,
  supabase,
} from '@/lib/supabase';
// @ts-expect-error TS(2792): Cannot find module 'lucide-react'. Did you mean to... Remove this comment to see the full error message
import { Truck, Activity, Settings, AlertTriangle } from 'lucide-react'; // Import icons

// Define the data quality stats type based on the database function
interface DataQualityStats {
  total_trucks: number;
  avg_quality_score: number;
  high_quality_count: number;
  medium_quality_count: number;
  low_quality_count: number;
  verified_count: number;
  pending_count: number;
  flagged_count: number;
}

function getDashboardData() {
  // Fetch total food trucks and verification statuses
  const { trucks: allTrucks } = await FoodTruckService.getAllTrucks(1000, 0); // Fetch a reasonable number for overview
  const totalFoodTrucks = allTrucks.length;
  const pendingVerifications = allTrucks.filter((t) => t.verification_status === 'pending').length;

  // Fetch pipeline status (e.g., pending scraping jobs)
  const pendingScrapingJobs = await ScrapingJobService.getJobsByStatus('pending');
  const runningScrapingJobs = await ScrapingJobService.getJobsByStatus('running');
  const failedScrapingJobs = await ScrapingJobService.getJobsByStatus('failed');

  // Fetch recent errors from data processing queue
  const failedProcessingQueueItems = await DataProcessingService.getQueueByStatus('failed');
  // Fetch data quality stats using the Supabase function
  const { data: qualityStatsResult, error: qualityError } = await supabase
    .rpc('get_data_quality_stats')
    .single();

  if (qualityError != undefined) {
    console.error('Error fetching data quality stats:', qualityError);
  }

  const dataQualityStats: DataQualityStats = (qualityStatsResult as DataQualityStats) ?? {
    total_trucks: 0,
    avg_quality_score: 0,
    high_quality_count: 0,
    medium_quality_count: 0,
    low_quality_count: 0,
    verified_count: 0,
    pending_count: 0,
    flagged_count: 0,
  };

  return {
    totalFoodTrucks,
    pendingVerifications,
    pendingScrapingJobsCount: pendingScrapingJobs.length,
    runningScrapingJobsCount: runningScrapingJobs.length,
    failedScrapingJobsCount: failedScrapingJobs.length,
    failedProcessingQueueItemsCount: failedProcessingQueueItems.length,
    dataQualityStats,
  };
}

export default function AdminDashboard() {
  const {
    totalFoodTrucks,
    pendingVerifications,
    pendingScrapingJobsCount,
    runningScrapingJobsCount,
    failedScrapingJobsCount,
    failedProcessingQueueItemsCount,
    dataQualityStats,
  } = await getDashboardData();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Food Trucks</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFoodTrucks}</div>
            <p className="text-xs text-muted-foreground">
              {pendingVerifications} pending verification
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingScrapingJobsCount} pending</div>
            <p className="text-xs text-muted-foreground">
              {runningScrapingJobsCount} running, {failedScrapingJobsCount} failed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((dataQualityStats.avg_quality_score ?? 0) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average quality score across all trucks
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Distribution</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dataQualityStats.high_quality_count ?? 0}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">{dataQualityStats.high_quality_count ?? 0} high</span>,{' '}
              <span className="text-yellow-600">{dataQualityStats.medium_quality_count ?? 0} medium</span>,{' '}
              <span className="text-red-600">{dataQualityStats.low_quality_count ?? 0} low</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedProcessingQueueItemsCount}</div>
            <p className="text-xs text-muted-foreground">from data processing queue</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
