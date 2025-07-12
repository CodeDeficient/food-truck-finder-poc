
'use client';

import { useFoodTrucks, DataStatusIndicator } from '@/lib/fallback/supabaseFallback';
import {
  ScrapingJobService,
  DataProcessingService,
  supabase,
} from '@/lib/supabase';
import { TotalFoodTrucksCard } from '@/components/admin/dashboard/TotalFoodTrucksCard';
import { PipelineStatusCard } from '@/components/admin/dashboard/PipelineStatusCard';
import { DataQualityScoreCard } from '@/components/admin/dashboard/DataQualityScoreCard';
import { QualityDistributionCard } from '@/components/admin/dashboard/QualityDistributionCard';
import { RecentErrorsCard } from '@/components/admin/dashboard/RecentErrorsCard';
import { useEffect, useState } from 'react';

// Define the data quality stats type based on the database function
interface DataQualityStats {
  readonly total_trucks: number;
  readonly avg_quality_score: number;
  readonly high_quality_count: number;
  readonly medium_quality_count: number;
  readonly low_quality_count: number;
  readonly verified_count: number;
  readonly pending_count: number;
  readonly flagged_count: number;
}

export default function AdminDashboard() {
  const { trucks, loading, dataStatus } = useFoodTrucks();
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    async function getDashboardData() {
      const pendingVerifications = trucks.filter((t) => t.verification_status === 'pending').length;

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

      setDashboardData({
        totalFoodTrucks: trucks.length,
        pendingVerifications,
        pendingScrapingJobsCount: pendingScrapingJobs.length,
        runningScrapingJobsCount: runningScrapingJobs.length,
        failedScrapingJobsCount: failedScrapingJobs.length,
        failedProcessingQueueItemsCount: failedProcessingQueueItems.length,
        dataQualityStats,
      });
    }

    if (trucks.length > 0) {
      getDashboardData();
    }
  }, [trucks]);

  if (loading || !dashboardData) {
    return <div>Loading...</div>;
  }

  if (dataStatus.status === 'unavailable') {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <DataStatusIndicator status={dataStatus} />
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">Food truck data is currently unavailable. Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <DataStatusIndicator status={dataStatus} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TotalFoodTrucksCard
          totalFoodTrucks={dashboardData.totalFoodTrucks}
          pendingVerifications={dashboardData.pendingVerifications}
        />
        <PipelineStatusCard
          pendingScrapingJobsCount={dashboardData.pendingScrapingJobsCount}
          runningScrapingJobsCount={dashboardData.runningScrapingJobsCount}
          failedScrapingJobsCount={dashboardData.failedScrapingJobsCount}
        />
        <DataQualityScoreCard dataQualityStats={dashboardData.dataQualityStats} />
        <QualityDistributionCard dataQualityStats={dashboardData.dataQualityStats} />
        <RecentErrorsCard failedProcessingQueueItemsCount={dashboardData.failedProcessingQueueItemsCount} />
      </div>
    </div>
  );
}
