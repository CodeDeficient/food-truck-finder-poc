import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrapingJob } from '@/lib/supabase';
import { ScrapingJobRow } from './ScrapingJobRow';

interface ScrapingJobsTableContentProps {
  readonly scrapingJobs: {
    pending: ScrapingJob[];
    running: ScrapingJob[];
    failed: ScrapingJob[];
    completed: ScrapingJob[];
  };
}

export function ScrapingJobsTableContent({ scrapingJobs }: Readonly<ScrapingJobsTableContentProps>) {
  return (
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
            <ScrapingJobRow key={job.id} job={job} />
          ))}
      </TableBody>
    </Table>
  );
}
