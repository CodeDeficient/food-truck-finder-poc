import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface PipelineStatusCardProps {
  pendingScrapingJobsCount: number;
  runningScrapingJobsCount: number;
  failedScrapingJobsCount: number;
}

export function PipelineStatusCard({
  pendingScrapingJobsCount,
  runningScrapingJobsCount,
  failedScrapingJobsCount,
}: PipelineStatusCardProps) {
  return (
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
  );
}
