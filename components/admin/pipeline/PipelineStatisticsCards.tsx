
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw, PlayCircle, XCircle } from 'lucide-react';
import type { ScrapingJob, DataProcessingQueue } from '@/lib/supabase';

interface PipelineStatisticsCardsProps {
  readonly scrapingJobs: {
    pending: ScrapingJob[];
    running: ScrapingJob[];
    failed: ScrapingJob[];
    completed: ScrapingJob[];
  };
  readonly processingQueue: {
    pending: DataProcessingQueue[];
    processing: DataProcessingQueue[];
    failed: DataProcessingQueue[];
    completed: DataProcessingQueue[];
  };
}

/**
 * Renders a grid of statistic cards for pipeline status
 * @example
 * PipelineStatisticsCards({ scrapingJobs: { pending: [], running: [], failed: [] }, processingQueue: { failed: [] } })
 * <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">...</div>
 * @param {object} {scrapingJobs, processingQueue} - Contains arrays representing the status of scraping jobs and processing queue.
 * @returns {JSX.Element} A JSX element representing a set of status cards for the pipeline.
 * @description
 *   - Displays pending, running, failed scraping jobs, and failed queue items.
 *   - Each card shows a different metric with an appropriate icon.
 *   - Utilizes Tailwind CSS classes for styling.
 */
export function PipelineStatisticsCards({
  scrapingJobs,
  processingQueue,
}: PipelineStatisticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scraping Jobs (Pending)</CardTitle>
          <RefreshCcw className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scrapingJobs.pending.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scraping Jobs (Running)</CardTitle>
          <PlayCircle className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scrapingJobs.running.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scraping Jobs (Failed)</CardTitle>
          <XCircle className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scrapingJobs.failed.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing Queue (Failed)</CardTitle>
          <XCircle className="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processingQueue.failed.length}</div>
        </CardContent>
      </Card>
    </div>
  );
}
