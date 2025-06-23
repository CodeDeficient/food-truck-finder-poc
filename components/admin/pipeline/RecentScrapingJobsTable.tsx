import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrapingJob } from '@/lib/supabase';
import { ScrapingJobsTableContent } from './ScrapingJobsTableContent';

interface RecentScrapingJobsTableProps {
  readonly scrapingJobs: {
    pending: ScrapingJob[];
    running: ScrapingJob[];
    failed: ScrapingJob[];
    completed: ScrapingJob[];
  };
}

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
