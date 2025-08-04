interface PipelineStatusCardProps {
    readonly pendingScrapingJobsCount: number;
    readonly runningScrapingJobsCount: number;
    readonly failedScrapingJobsCount: number;
}
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
export declare function PipelineStatusCard({ pendingScrapingJobsCount, runningScrapingJobsCount, failedScrapingJobsCount, }: Readonly<PipelineStatusCardProps>): import("react").JSX.Element;
export {};
