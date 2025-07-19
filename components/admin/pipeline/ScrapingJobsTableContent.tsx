
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ScrapingJob } from '@/lib/supabase';
import { ScrapingJobRow } from './ScrapingJobRow';

interface ScrapingJobsTableContentProps {
  readonly scrapingJobs: {
    pending: ScrapingJob[];
    running: ScrapingJob[];
    failed: ScrapingJob[];
    completed: ScrapingJob[];
  };
}

/**
 * Renders a table displaying the content of scraping jobs with various details such as status, priority, and actions.
 * @example
 * ScrapingJobsTableContent({ scrapingJobs: sampleScrapingJobs })
 * <Table>...</Table>
 * @param {Readonly<ScrapingJobsTableContentProps>} {scrapingJobs} - Contains lists of scraping jobs categorized by their current status.
 * @returns {JSX.Element} A table component representing the scraping jobs with specific formatting and columns.
 * @description
 *   - Jobs are sorted by the creation date in descending order.
 *   - The table displays only the latest 20 scraping jobs.
 *   - Each job entry in the table is rendered using the ScrapingJobRow component.
 *   - Supports job statuses: pending, running, failed, and completed.
 */
export function ScrapingJobsTableContent({
  scrapingJobs,
}: Readonly<ScrapingJobsTableContentProps>) {
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
