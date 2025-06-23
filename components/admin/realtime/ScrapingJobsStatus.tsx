'use client';

import React from 'react';

interface ScrapingJobsMetrics {
  active: number;
  completed: number;
  failed: number;
  pending: number;
}

interface ScrapingJobsStatusProps {
  scrapingJobs?: ScrapingJobsMetrics;
}

export function ScrapingJobsStatus({ scrapingJobs }: ScrapingJobsStatusProps) {
  if (scrapingJobs === undefined) return null;

  return (
    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="text-sm font-medium text-blue-900 mb-2">Scraping Jobs Status</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="text-blue-600">Active:</span>
          <span className="ml-1 font-medium">{scrapingJobs.active}</span>
        </div>
        <div>
          <span className="text-green-600">Completed:</span>
          <span className="ml-1 font-medium">{scrapingJobs.completed}</span>
        </div>
        <div>
          <span className="text-yellow-600">Pending:</span>
          <span className="ml-1 font-medium">{scrapingJobs.pending}</span>
        </div>
        <div>
          <span className="text-red-600">Failed:</span>
          <span className="ml-1 font-medium">{scrapingJobs.failed}</span>
        </div>
      </div>
    </div>
  );
}
