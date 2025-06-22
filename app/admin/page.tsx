import React from 'react';
import {
  FoodTruckService,
  ScrapingJobService,
  DataProcessingService,
  supabase,
} from '@/lib/supabase';
import { TotalFoodTrucksCard } from '@/components/admin/dashboard/TotalFoodTrucksCard';
import { PipelineStatusCard } from '@/components/admin/dashboard/PipelineStatusCard';
import { DataQualityScoreCard } from '@/components/admin/dashboard/DataQualityScoreCard';
import { QualityDistributionCard } from '@/components/admin/dashboard/QualityDistributionCard';
import { RecentErrorsCard } from '@/components/admin/dashboard/RecentErrorsCard';

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

async function getDashboardData() {
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

export default async function AdminDashboard() {
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
        <TotalFoodTrucksCard
          totalFoodTrucks={totalFoodTrucks}
          pendingVerifications={pendingVerifications}
        />
        <PipelineStatusCard
          pendingScrapingJobsCount={pendingScrapingJobsCount}
          runningScrapingJobsCount={runningScrapingJobsCount}
          failedScrapingJobsCount={failedScrapingJobsCount}
        />
        <DataQualityScoreCard dataQualityStats={dataQualityStats} />
        <QualityDistributionCard dataQualityStats={dataQualityStats} />
        <RecentErrorsCard failedProcessingQueueItemsCount={failedProcessingQueueItemsCount} />
      </div>
    </div>
  );
}
