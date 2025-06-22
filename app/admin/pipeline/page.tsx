import React from 'react';
import {
  ScrapingJobService,
  DataProcessingService,
  ScrapingJob,
  DataProcessingQueue,
} from '@/lib/supabase';
import { PipelineStatisticsCards } from '@/components/admin/pipeline/PipelineStatisticsCards';
import { RecentScrapingJobsTable } from '@/components/admin/pipeline/RecentScrapingJobsTable';
import { FailedProcessingQueueTable } from '@/components/admin/pipeline/FailedProcessingQueueTable';

async function getPipelineData() {
  const pendingScrapingJobs = await ScrapingJobService.getJobsByStatus('pending');
  const runningScrapingJobs = await ScrapingJobService.getJobsByStatus('running');
  const completedScrapingJobs = await ScrapingJobService.getJobsByStatus('completed');
  const failedScrapingJobs = await ScrapingJobService.getJobsByStatus('failed');

  const pendingProcessingQueue = await DataProcessingService.getQueueByStatus('pending');
  const processingProcessingQueue = await DataProcessingService.getQueueByStatus('processing');
  const completedProcessingQueue = await DataProcessingService.getQueueByStatus('completed');
  const failedProcessingQueue = await DataProcessingService.getQueueByStatus('failed');

  return {
    scrapingJobs: {
      pending: pendingScrapingJobs,
      running: runningScrapingJobs,
      completed: completedScrapingJobs,
      failed: failedScrapingJobs,
    },
    processingQueue: {
      pending: pendingProcessingQueue,
      processing: processingProcessingQueue,
      completed: completedProcessingQueue,
      failed: failedProcessingQueue,
    },
  };
}

export default async function PipelineMonitoringPage() {
  const { scrapingJobs, processingQueue } = await getPipelineData();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Pipeline Monitoring</h1>

      <PipelineStatisticsCards scrapingJobs={scrapingJobs} processingQueue={processingQueue} />

      <RecentScrapingJobsTable scrapingJobs={scrapingJobs} />

      <FailedProcessingQueueTable processingQueue={processingQueue} />
    </div>
  );
}
