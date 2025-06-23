import React from 'react';
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
import { ScrapingJob } from '@/lib/supabase';

function getBadgeVariant(status: string) {
  if (status === 'completed') {
    return 'default';
  }
  if (status === 'failed') {
    return 'destructive';
  }
  return 'outline';
}

interface RecentScrapingJobsTableProps {
  readonly scrapingJobs: {
    pending: ScrapingJob[];
    running: ScrapingJob[];
    failed: ScrapingJob[];
    completed: ScrapingJob[];
  };
}

export function RecentScrapingJobsTable({ scrapingJobs }: RecentScrapingJobsTableProps) {
  return (
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
                    {job.completed_at == undefined ? 'N/A' : new Date(job.completed_at).toLocaleString()}
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
  );
}
