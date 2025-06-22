import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCcw, PlayCircle, XCircle } from 'lucide-react';
import { ScrapingJob, DataProcessingQueue } from '@/lib/supabase';

interface PipelineStatisticsCardsProps {
  scrapingJobs: {
    pending: ScrapingJob[];
    running: ScrapingJob[];
    failed: ScrapingJob[];
    completed: ScrapingJob[];
  };
  processingQueue: {
    pending: DataProcessingQueue[];
    processing: DataProcessingQueue[];
    failed: DataProcessingQueue[];
    completed: DataProcessingQueue[];
  };
}

export function PipelineStatisticsCards({ scrapingJobs, processingQueue }: PipelineStatisticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scraping Jobs (Pending)</CardTitle>
          <RefreshCcw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scrapingJobs.pending.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scraping Jobs (Running)</CardTitle>
          <PlayCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scrapingJobs.running.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Scraping Jobs (Failed)</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{scrapingJobs.failed.length}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processing Queue (Failed)</CardTitle>
          <XCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{processingQueue.failed.length}</div>
        </CardContent>
      </Card>
    </div>
  );
}
