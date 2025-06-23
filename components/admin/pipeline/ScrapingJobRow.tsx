import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrapingJob } from '@/lib/supabase';

interface ScrapingJobRowProps {
  readonly job: ScrapingJob;
}

function getBadgeVariant(status: string) {
  if (status === 'completed') {
    return 'default';
  }
  if (status === 'failed') {
    return 'destructive';
  }
  return 'outline';
}

export function ScrapingJobRow({ job }: ScrapingJobRowProps) {
  return (
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
  );
}
