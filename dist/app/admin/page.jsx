'use client';
import { useFoodTrucks, DataStatusIndicator } from '@/lib/fallback/supabaseFallback';
import { ScrapingJobService, DataProcessingService, supabase, } from '@/lib/supabase';
import { TotalFoodTrucksCard } from '@/components/admin/dashboard/TotalFoodTrucksCard';
import { PipelineStatusCard } from '@/components/admin/dashboard/PipelineStatusCard';
import { DataQualityScoreCard } from '@/components/admin/dashboard/DataQualityScoreCard';
import { QualityDistributionCard } from '@/components/admin/dashboard/QualityDistributionCard';
import { RecentErrorsCard } from '@/components/admin/dashboard/RecentErrorsCard';
import { useEffect, useState } from 'react';
export default function AdminDashboard() {
    const { trucks, loading, dataStatus } = useFoodTrucks();
    const [dashboardData, setDashboardData] = useState(undefined);
    useEffect(() => {
        const getDashboardData = async () => {
            var _a;
            const pendingVerifications = trucks.filter((t) => t.verification_status === 'pending').length;
            const pendingScrapingJobs = await ScrapingJobService.getJobsByStatus('pending');
            const runningScrapingJobs = await ScrapingJobService.getJobsByStatus('running');
            const failedScrapingJobs = await ScrapingJobService.getJobsByStatus('failed');
            const failedProcessingQueueItems = await DataProcessingService.getQueueByStatus('failed');
            const { data: qualityStatsResult, error: qualityError } = await supabase
                .rpc('get_data_quality_stats')
                .single();
            if (qualityError) {
                // The error is logged here, but the promise rejection will be caught below.
                console.error('Error fetching data quality stats:', qualityError);
                throw qualityError; // Re-throw to be caught by the .catch() block
            }
            const dataQualityStats = (_a = qualityStatsResult) !== null && _a !== void 0 ? _a : {
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
        };
        if (trucks.length > 0) {
            // Correctly handle the floating promise by wrapping the call and adding a .catch block.
            (async () => {
                await getDashboardData();
            })().catch(error => {
                console.error("An unhandled error occurred in getDashboardData:", error);
            });
        }
    }, [trucks]);
    if (loading || !dashboardData) {
        return <div>Loading...</div>;
    }
    if (dataStatus.status === 'unavailable') {
        return (<div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <DataStatusIndicator status={dataStatus}/>
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">Food truck data is currently unavailable. Please try again later.</p>
        </div>
      </div>);
    }
    return (<div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <DataStatusIndicator status={dataStatus}/>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <TotalFoodTrucksCard totalFoodTrucks={dashboardData.totalFoodTrucks} pendingVerifications={dashboardData.pendingVerifications}/>
        <PipelineStatusCard pendingScrapingJobsCount={dashboardData.pendingScrapingJobsCount} runningScrapingJobsCount={dashboardData.runningScrapingJobsCount} failedScrapingJobsCount={dashboardData.failedScrapingJobsCount}/>
        <DataQualityScoreCard dataQualityStats={dashboardData.dataQualityStats}/>
        <QualityDistributionCard dataQualityStats={dashboardData.dataQualityStats}/>
        <RecentErrorsCard failedProcessingQueueItemsCount={dashboardData.failedProcessingQueueItemsCount}/>
      </div>
    </div>);
}
