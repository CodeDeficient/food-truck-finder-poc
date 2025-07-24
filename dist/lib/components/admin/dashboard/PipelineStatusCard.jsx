import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity } from 'lucide-react';
/**
 * Renders a card displaying the status of pipeline jobs including pending, running, and failed counts.
 * @example
 * PipelineStatusCard({
 *   pendingScrapingJobsCount: 10,
 *   runningScrapingJobsCount: 5,
 *   failedScrapingJobsCount: 2
 * })
 * <Card>
 *   <CardHeader>...</CardHeader>
 *   <CardContent>...</CardContent>
 * </Card>
 * @param {number} pendingScrapingJobsCount - The count of scraping jobs that are currently pending.
 * @param {number} runningScrapingJobsCount - The count of scraping jobs that are currently running.
 * @param {number} failedScrapingJobsCount - The count of scraping jobs that have failed.
 * @returns {JSX.Element} A card component displaying the pipeline status including counts of pending, running, and failed jobs.
 * @description
 *   - Utilizes Card, CardHeader, CardTitle, CardContent components for UI structure.
 *   - Applies flex and spacing utility classes for layout and styling.
 */
export function PipelineStatusCard({ pendingScrapingJobsCount, runningScrapingJobsCount, failedScrapingJobsCount, }) {
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pipeline Status</CardTitle>
        <Activity className="size-4 text-muted-foreground"/>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{pendingScrapingJobsCount} pending</div>
        <p className="text-xs text-muted-foreground">
          {runningScrapingJobsCount} running, {failedScrapingJobsCount} failed
        </p>
      </CardContent>
    </Card>);
}
