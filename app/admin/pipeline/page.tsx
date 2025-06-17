import React from 'react';
import {
  ScrapingJobService,
  DataProcessingService,
  ScrapingJob,
  DataProcessingQueue,
} from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
// @ts-expect-error TS(2792): Cannot find module 'lucide-react'. Did you mean to... Remove this comment to see the full error message
import { RefreshCcw, PlayCircle, XCircle } from 'lucide-react';

function getBadgeVariant(status: string) {
  if (status === 'completed') {
    return 'default';
  }
  if (status === 'failed') {
    return 'destructive';
  }
  return 'outline';
}

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

export default function PipelineMonitoringPage() {
  const { scrapingJobs, processingQueue } = await getPipelineData();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Pipeline Monitoring</h1>

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

      <Card>
        <CardHeader>
          <CardTitle>Recent Scraping Jobs</CardTitle>
          <CardDescription>Overview of recent web scraping activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Type</TableHead>
                <TableHead>Target URL/Handle</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Retries</TableHead>
                <TableHead>Scheduled At</TableHead>
                <TableHead>Completed At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                ...scrapingJobs.pending,
                ...scrapingJobs.running,
                ...scrapingJobs.failed,
                ...scrapingJobs.completed,
              ]
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 20) // Show latest 20 jobs
                .map((job: ScrapingJob) => (
                  <TableRow key={job.id}>
                    <TableCell className="font-medium">{job.job_type}</TableCell>
                    <TableCell>{job.target_url ?? job.target_handle}</TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(job.status)}>{job.status}</Badge>
                    </TableCell>
                    <TableCell>{job.priority}</TableCell>
                    <TableCell>
                      {job.retry_count}/{job.max_retries}
                    </TableCell>
                    <TableCell>{new Date(job.scheduled_at).toLocaleString()}</TableCell>
                    <TableCell>
                      {job.completed_at == undefined ? 'N/A'  : new Date(job.completed_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {job.status === 'failed' && (
                        <Button variant="outline" size="sm" className="mr-2">
                          Retry
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        View Logs
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Failed Data Processing Queue Items</CardTitle>
          <CardDescription>
            Items that failed during data processing (e.g., Gemini API errors).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Truck ID</TableHead>
                <TableHead>Processing Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead className="text-right">Errors</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processingQueue.failed.map((item: DataProcessingQueue) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.truck_id ?? 'N/A'}</TableCell>
                  <TableCell>{item.processing_type}</TableCell>
                  <TableCell>
                    <Badge variant="destructive">{item.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(item.created_at).toLocaleString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
