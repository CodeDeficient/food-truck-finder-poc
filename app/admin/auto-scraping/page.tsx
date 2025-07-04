'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw, Play, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CronJobStatus {
  id: string;
  name: string;
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  status: 'running' | 'idle' | 'error';
  lastResult?: {
    success: boolean;
    message: string;
    trucksProcessed?: number;
    newTrucksFound?: number;
    errors?: number;
  };
}

interface ScrapingMetrics {
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
  averageRunTime: number;
  totalTrucksProcessed: number;
  newTrucksToday: number;
}

// Loading state component
/**
 * Displays a loading state for the Auto-Scraping Dashboard with pulsing placeholders.
 * @example
 * LoadingState()
 * <div className="space-y-6">...</div>
 * @returns {JSX.Element} JSX component representing the loading state for the dashboard.
 * @description
 *   - Utilizes `Array.from` to create an array of length 4 for rendering four loading cards.
 *   - Each card contains header elements with `animate-pulse` CSS classes for pulsing effect.
 *   - Layout adjusts with CSS grid classes for responsive design across different screen sizes.
 */
function LoadingState() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Auto-Scraping Dashboard</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Individual metric card component
/**
 * Renders a metric card with a title, value, subtitle, and an optional icon.
 * @example
 * MetricCard({ title: "Revenue", value: "$1000", subtitle: "per month", icon: <RevenueIcon /> })
 * 
 * @param {{readonly title: string, readonly value: string | number, readonly subtitle: string, readonly icon: React.ReactNode}} props - Object containing the metric card properties.
 * @returns {JSX.Element} A React component that displays a card with a title, value, subtitle, and icon.
 * @description
 *   - Utilizes a flexbox layout to arrange the title and icon within the card header.
 *   - Dynamically adjusts the content style based on the provided value type.
 */
function MetricCard({
  title,
  value,
  subtitle,
  icon,
}: {
  readonly title: string;
  readonly value: string | number;
  readonly subtitle: string;
  readonly icon: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

// Metrics cards component
/**
 * Renders a grid of metrics cards displaying scraping statistics.
 * @example
 * MetricsCards({ metrics: { totalRuns: 100, successfulRuns: 80, failedRuns: 20, totalTrucksProcessed: 300, newTrucksToday: 10 } })
 * // Returns a grid of metric cards for visualization in a dashboard.
 * @param {Object} metrics - Contains scraping metrics data.
 * @param {number} metrics.totalRuns - Total number of runs executed.
 * @param {number} metrics.successfulRuns - Number of successful scraping runs.
 * @param {number} metrics.failedRuns - Number of failed scraping runs.
 * @param {number} metrics.totalTrucksProcessed - Total number of trucks processed.
 * @param {number} metrics.newTrucksToday - Number of new trucks found today.
 * @returns {JSX.Element} A grid layout of MetricCard components displaying various statistics.
 * @description
 *   - Computes the success rate for scraping as a percentage.
 *   - Renders individual MetricCard components for each statistic with relevant icons.
 *   - The layout adjusts based on screen size utilizing a grid format.
 */
function MetricsCards({ metrics }: { readonly metrics: ScrapingMetrics }) {
  const successRate =
    metrics.totalRuns > 0 ? Math.round((metrics.successfulRuns / metrics.totalRuns) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Runs"
        value={metrics.totalRuns}
        subtitle={`${metrics.successfulRuns} successful`}
        icon={<RefreshCw className="size-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Success Rate"
        value={`${successRate}%`}
        subtitle={`${metrics.failedRuns} failed runs`}
        icon={<CheckCircle className="size-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Trucks Processed"
        value={metrics.totalTrucksProcessed}
        subtitle="Total trucks processed"
        icon={<Clock className="size-4 text-muted-foreground" />}
      />
      <MetricCard
        title="New Today"
        value={metrics.newTrucksToday}
        subtitle="New trucks found today"
        icon={<Play className="size-4 text-muted-foreground" />}
      />
    </div>
  );
}

// Cron job table row component
/**
* Renders a row in a table displaying information about a cron job's status.
* @example
* CronJobRow({
*   job: {
*     status: 'active',
*     name: 'Job1',
*     schedule: '*/
function CronJobRow({
  job,
  getStatusIcon,
  getStatusBadge,
}: {
  readonly job: CronJobStatus;
  readonly getStatusIcon: (status: string) => React.ReactNode;
  readonly getStatusBadge: (status: string) => React.ReactNode;
}) {
  return (
    <TableRow>
      <TableCell className="flex items-center gap-2">
        {getStatusIcon(job.status)}
        {job.name}
      </TableCell>
      <TableCell className="font-mono text-sm">{job.schedule}</TableCell>
      <TableCell>{getStatusBadge(job.status)}</TableCell>
      <TableCell>
        {job.lastRun == undefined ? 'Never' : new Date(job.lastRun).toLocaleString()}
      </TableCell>
      <TableCell>
        {job.nextRun == undefined ? 'Unknown' : new Date(job.nextRun).toLocaleString()}
      </TableCell>
      <TableCell>
        {job.lastResult ? (
          <div className="text-sm">
            <div className={job.lastResult.success ? 'text-green-600' : 'text-red-600'}>
              {job.lastResult.success ? 'Success' : 'Failed'}
            </div>
            {job.lastResult.trucksProcessed !== undefined && (
              <div className="text-xs text-muted-foreground">
                {job.lastResult.trucksProcessed} trucks, {job.lastResult.newTrucksFound} new
              </div>
            )}
          </div>
        ) : (
          'No data'
        )}
      </TableCell>
    </TableRow>
  );
}

// Cron jobs table component
/**
 * Renders a table displaying the status of scheduled cron jobs.
 * @example
 * CronJobsTable({
 *   cronJobs: cronJobsArray,
 *   getStatusIcon: statusIconFunction,
 *   getStatusBadge: statusBadgeFunction
 * })
 * Returns the React component with rendered table of cron jobs status.
 * @param {CronJobStatus[]} cronJobs - Array of cron job status objects.
 * @param {(status: string) => React.ReactNode} getStatusIcon - Function to get the status icon based on job status.
 * @param {(status: string) => React.ReactNode} getStatusBadge - Function to get the status badge based on job status.
 * @returns {ReactElement} The rendered React component for displaying cron jobs.
 * @description
 *   - Displays a message when there are no scheduled jobs found.
 *   - Uses CronJobRow components to render each job's details within the table.
 */
function CronJobsTable({
  cronJobs,
  getStatusIcon,
  getStatusBadge,
}: {
  readonly cronJobs: CronJobStatus[];
  readonly getStatusIcon: (status: string) => React.ReactNode;
  readonly getStatusBadge: (status: string) => React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Scheduled Jobs</CardTitle>
        <CardDescription>Background scraping jobs and their current status</CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="w-full">
          <TableHeader>
            <TableRow>
              <TableHead>Job Name</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Run</TableHead>
              <TableHead>Next Run</TableHead>
              <TableHead>Last Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cronJobs.map((job) => (
              <CronJobRow
                key={job.id}
                job={job}
                getStatusIcon={getStatusIcon}
                getStatusBadge={getStatusBadge}
              />
            ))}
            {cronJobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No scheduled jobs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Dashboard header component
/**
* Renders the dashboard header containing title and action buttons for refreshing and triggering a manual scrape.
* @example
* DashboardHeader({ onRefresh: handleRefresh, onTriggerScrape: handleManualScrape })
* <div className="flex items-center justify-between">
*   <h1 className="text-3xl font-bold">Auto-Scraping Dashboard</h1>
*   <Button onClick={handleRefresh} variant="outline" size="sm">Refresh</Button>
*   <Button onClick={handleManualScrape} size="sm">Trigger Manual Scrape</Button>
* </div>
* @param {Object} props - Component props.
* @param {Function} props.onRefresh - Callback function to refresh the dashboard data.
* @param {Function} props.onTriggerScrape - Callback function to trigger a manual data scrape.
* @returns {JSX.Element} A JSX element representation of the dashboard header.
* @description
*   - The component assumes the presence of 'Button', 'RefreshCw', and 'Play' components for rendering action buttons and icons.
*   - The header layout is styled using flexbox utilities for proper alignment and spacing.
*/
function DashboardHeader({
  onRefresh,
  onTriggerScrape,
}: {
  readonly onRefresh: () => void;
  readonly onTriggerScrape: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold">Auto-Scraping Dashboard</h1>
      <div className="flex gap-2">
        <Button onClick={onRefresh} variant="outline" size="sm">
          <RefreshCw className="size-4 mr-2" />
          Refresh
        </Button>
        <Button onClick={onTriggerScrape} size="sm">
          <Play className="size-4 mr-2" />
          Trigger Manual Scrape
        </Button>
      </div>
    </div>
  );
}

// Data fetching functions
async function fetchCronJobs() {
  const cronResponse = await fetch('/api/admin/cron-status');
  if (!cronResponse.ok) {
    throw new Error('Failed to fetch cron status');
  }
  const cronData = (await cronResponse.json()) as unknown;
  return Array.isArray((cronData as { jobs?: unknown }).jobs)
    ? (cronData as { jobs: CronJobStatus[] }).jobs
    : [];
}

async function fetchMetrics() {
  const metricsResponse = await fetch('/api/admin/scraping-metrics');
  if (!metricsResponse.ok) {
    throw new Error('Failed to fetch metrics');
  }
  const metricsData = (await metricsResponse.json()) as unknown;
  return (metricsData as { metrics?: ScrapingMetrics }).metrics;
}

async function triggerScrape() {
  const response = await fetch('/api/auto-scrape-initiate', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to trigger manual scrape');
  }
}

// Custom hook for dashboard data
/**
 * Custom hook to manage and fetch dashboard data related to cron jobs and scraping metrics.
 * @example
 * const { cronJobs, metrics, isLoading, error, fetchDashboardData, triggerManualScrape } = useDashboardData();
 * // Retrieves data periodically and handles manual scraping
 * @returns {object} An object containing state information and functions for interaction with the dashboard data.
 * @description
 *   - Initiates fetching of data immediately on component mount and periodically every 30 seconds.
 *   - Provides functionality to manually trigger a data scrape with error logging.
 *   - Manages loading state and error notification for dashboard operations.
 */
function useDashboardData() {
  const [cronJobs, setCronJobs] = useState<CronJobStatus[]>([]);
  const [metrics, setMetrics] = useState<ScrapingMetrics | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  /**
  * Fetches and updates data for cron jobs and metrics with loading state management.
  * @example
  * sync()
  * void
  * @param {void} - No parameters are required.
  * @returns {Promise<void>} Executes asynchronously, updating states on completion.
  * @description
  *   - Manages the loading state to enhance user experience while data is being fetched.
  *   - Handles errors gracefully by updating an error state for UI feedback.
  *   - Combines data fetching operations to optimize performance using Promise.all.
  *   - Logs errors in detail for developers' debugging purposes.
  */
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      const [cronJobsData, metricsData] = await Promise.all([fetchCronJobs(), fetchMetrics()]);
      setCronJobs(cronJobsData);
      setMetrics(metricsData);
    } catch (error_) {
      // Log detailed error for developers
      console.error('Dashboard data fetch error:', error_);
      setError("That didn't work, please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Initiates a manual sync process for data scraping and dashboard update.
   * @example
   * sync()
   * undefined
   * @returns {undefined} Returns nothing; primarily triggers side effects.
   * @description
   *   - Resets error state before initiating scrape.
   *   - Uses an artificial delay for fetching dashboard data.
   *   - Implements error handling with user-friendly messaging.
   *   - Logs detailed errors for development purposes.
   */
  const triggerManualScrape = async () => {
    try {
      setError(undefined);
      await triggerScrape();
      setTimeout(() => {
        void fetchDashboardData();
      }, 2000);
    } catch (error_) {
      // Log detailed error for developers
      console.error('Manual scrape trigger error:', error_);
      setError("That didn't work, please try again later.");
    }
  };

  useEffect(() => {
    void fetchDashboardData();
    const interval = setInterval(() => {
      void fetchDashboardData();
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  return { cronJobs, metrics, isLoading, error, fetchDashboardData, triggerManualScrape };
}

// Status helper functions
/**
 * Returns an icon component based on the given status.
 * @example
 * getStatusIcon('running')
 * <RefreshCw className="size-4 animate-spin text-blue-500" />
 * @param {string} status - The status for which the icon needs to be determined.
 * @returns {JSX.Element} The icon component corresponding to the status.
 * @description
 *   - The default case returns a check circle for statuses other than 'running' and 'error'.
 *   - Icons include specific CSS classes for size and color styling.
 *   - Some icons have additional animation styles.
 */
function getStatusIcon(status: string) {
  switch (status) {
    case 'running': {
      return <RefreshCw className="size-4 animate-spin text-blue-500" />;
    }
    case 'error': {
      return <AlertCircle className="size-4 text-red-500" />;
    }
    default: {
      return <CheckCircle className="size-4 text-green-500" />;
    }
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
    running: 'default',
    idle: 'secondary',
    error: 'destructive',
  };
  return <Badge variant={variants[status] ?? 'secondary'}>{status}</Badge>;
}

/**
 * Represents a dashboard for managing and monitoring web scraping tasks.
 * @example
 * AutoScrapingDashboard()
 * Returns a JSX element to display the dashboard UI.
 * @returns {JSX.Element} Rendered dashboard component.
 * @description
 *   - Utilizes the `useDashboardData` custom hook to manage data fetching and state.
 *   - Displays a loading indicator when data is being fetched.
 *   - Provides functions for refreshing data and triggering manual scraping.
 *   - Displays error messages and fetched metrics in a user-friendly manner.
 */
export default function AutoScrapingDashboard() {
  const { cronJobs, metrics, isLoading, error, fetchDashboardData, triggerManualScrape } =
    useDashboardData();

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        onRefresh={() => {
          void fetchDashboardData();
        }}
        onTriggerScrape={() => {
          void triggerManualScrape();
        }}
      />

      {error !== undefined && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {metrics !== undefined && <MetricsCards metrics={metrics} />}

      <CronJobsTable
        cronJobs={cronJobs}
        getStatusIcon={getStatusIcon}
        getStatusBadge={getStatusBadge}
      />
    </div>
  );
}
