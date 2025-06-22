import { SchedulerTask } from './types';

export let schedulerInstance: { started: string } | undefined;
export const schedulerTasks: SchedulerTask[] = [
  {
    id: 'instagram_scrape',
    name: 'Instagram Data Scraping',
    enabled: true,
    intervalMinutes: 120,
    lastRun: new Date(Date.now() - 1_800_000).toISOString(),
    lastSuccess: new Date(Date.now() - 1_800_000).toISOString(),
    successCount: 45,
    errorCount: 3,
    nextRun: new Date(Date.now() + 5_400_000).toISOString(),
  },
  {
    id: 'website_crawl',
    name: 'Website Crawling',
    enabled: true,
    intervalMinutes: 360,
    lastRun: new Date(Date.now() - 7_200_000).toISOString(),
    lastSuccess: new Date(Date.now() - 7_200_000).toISOString(),
    successCount: 23,
    errorCount: 1,
    nextRun: new Date(Date.now() + 14_400_000).toISOString(),
  },
  {
    id: 'data_quality_check',
    name: 'Data Quality Assessment',
    enabled: true,
    intervalMinutes: 720,
    lastRun: new Date(Date.now() - 21_600_000).toISOString(),
    lastSuccess: new Date(Date.now() - 21_600_000).toISOString(),
    successCount: 12,
    errorCount: 0,
    nextRun: new Date(Date.now() + 21_600_000).toISOString(),
  },
  {
    id: 'gemini_processing',
    name: 'AI Data Processing',
    enabled: false,
    intervalMinutes: 480,
    lastRun: new Date(Date.now() - 28_800_000).toISOString(),
    lastSuccess: new Date(Date.now() - 28_800_000).toISOString(),
    successCount: 8,
    errorCount: 2,
    lastError: 'Rate limit exceeded',
    nextRun: undefined,
  },
  {
    id: 'location_update',
    name: 'Real-time Location Updates',
    enabled: true,
    intervalMinutes: 30,
    lastRun: new Date(Date.now() - 900_000).toISOString(),
    lastSuccess: new Date(Date.now() - 900_000).toISOString(),
    successCount: 156,
    errorCount: 8,
    nextRun: new Date(Date.now() + 900_000).toISOString(),
  },
];

export function setSchedulerInstance(instance: { started: string } | undefined) {
  schedulerInstance = instance;
}
