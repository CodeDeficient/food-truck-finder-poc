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
function MetricsCards({ metrics }: { readonly metrics: ScrapingMetrics }) {
  const successRate =
    metrics.totalRuns > 0 ? Math.round((metrics.successfulRuns / metrics.totalRuns) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard
        title="Total Runs"
        value={metrics.totalRuns}
        subtitle={`${metrics.successfulRuns} successful`}
        icon={<RefreshCw className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Success Rate"
        value={`${successRate}%`}
        subtitle={`${metrics.failedRuns} failed runs`}
        icon={<CheckCircle className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="Trucks Processed"
        value={metrics.totalTrucksProcessed}
        subtitle="Total trucks processed"
        icon={<Clock className="h-4 w-4 text-muted-foreground" />}
      />
      <MetricCard
        title="New Today"
        value={metrics.newTrucksToday}
        subtitle="New trucks found today"
        icon={<Play className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}

// Cron job table row component
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
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button onClick={onTriggerScrape} size="sm">
          <Play className="h-4 w-4 mr-2" />
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
function useDashboardData() {
  const [cronJobs, setCronJobs] = useState<CronJobStatus[]>([]);
  const [metrics, setMetrics] = useState<ScrapingMetrics | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

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
function getStatusIcon(status: string) {
  switch (status) {
    case 'running': {
      return <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />;
    }
    case 'error': {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    }
    default: {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
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
          <AlertCircle className="h-4 w-4" />
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
