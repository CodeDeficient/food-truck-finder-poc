import React from 'react';
import { ScrapingJobService, DataProcessingService } from '@/lib/supabase';
import { PipelineStatisticsCards } from '@/components/admin/pipeline/PipelineStatisticsCards';
import { RecentScrapingJobsTable } from '@/components/admin/pipeline/RecentScrapingJobsTable';
import { FailedProcessingQueueTable } from '@/components/admin/pipeline/FailedProcessingQueueTable';

/**
 * Retrieves the current status of all jobs in the pipeline for both scraping and processing.
 * @example
 * getPipelineData()
 * {
 *   scrapingJobs: {
 *     pending: [...],
 *     running: [...],
 *     completed: [...],
 *     failed: [...],
 *   },
 *   processingQueue: {
 *     pending: [...],
 *     processing: [...],
 *     completed: [...],
 *     failed: [...],
 *   }
 * }
 * @returns {Object} An object containing the statuses of jobs and processing queues in the pipeline.
 * @description
 *   - The function organizes jobs and processing queues based on their current status into structured objects.
 *   - Utilizes services to fetch data based on job or queue status such as 'pending', 'running', 'completed', and 'failed'.
 */
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

/**
 * Displays a pipeline monitoring page with data overview.
 * @example
 * PipelineMonitoringPage()
 * <div>...</div> JSX Elements
 * @returns {JSX.Element} The JSX structure for the pipeline monitoring page.
 * @description
 *   - Retrieves pipeline data such as scraping jobs and processing queue.
 *   - Structures the page with statistics cards and recent/failure tables.
 *   - Utilizes Flexbox CSS properties for layout styling.
 *   - Components for various data visualizations are used like PipelineStatisticsCards.
 */
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
