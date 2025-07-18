
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ScrapingJob } from '@/lib/supabase';
import { ScrapingJobsTableContent } from './ScrapingJobsTableContent';

interface RecentScrapingJobsTableProps {
  readonly scrapingJobs: {
    pending: ScrapingJob[];
    running: ScrapingJob[];
    failed: ScrapingJob[];
    completed: ScrapingJob[];
  };
}

/**
* Displays a table of recent scraping jobs in a card layout.
* @example
* RecentScrapingJobsTable({ scrapingJobs: [{ id: 1, name: 'Job 1' }, { id: 2, name: 'Job 2' }] })
* <Card>...</Card>
* @param {Readonly<RecentScrapingJobsTableProps>} {scrapingJobs} - An object containing an array of recent scraping job details.
* @returns {JSX.Element} A card component displaying the recent scraping jobs.
* @description
*   - Utilizes the Card, CardHeader, CardTitle, and CardContent components to structure the display.
*   - Embeds the ScrapingJobsTableContent component to present scraping job details.
*   - Part of the admin pipeline interface for monitoring scraping tasks.
*/
export function RecentScrapingJobsTable({ scrapingJobs }: Readonly<RecentScrapingJobsTableProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Scraping Jobs</CardTitle>
        <CardDescription>Overview of recent web scraping activities.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrapingJobsTableContent scrapingJobs={scrapingJobs} />
      </CardContent>
    </Card>
  );
}
