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

export default function AutoScrapingDashboard() {
  const [cronJobs, setCronJobs] = useState<CronJobStatus[]>([]);
  const [metrics, setMetrics] = useState<ScrapingMetrics | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    void fetchDashboardData();
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      void fetchDashboardData();
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(undefined);
      // Fetch cron job statuses
      const cronResponse = await fetch('/api/admin/cron-status');
      if (!cronResponse.ok) {
        throw new Error('Failed to fetch cron status');
      }
      const cronData = (await cronResponse.json()) as unknown;
      setCronJobs(
        Array.isArray((cronData as { jobs?: unknown }).jobs)
          ? (cronData as { jobs: CronJobStatus[] }).jobs
          : [],
      );
      // Fetch scraping metrics
      const metricsResponse = await fetch('/api/admin/scraping-metrics');
      if (!metricsResponse.ok) {
        throw new Error('Failed to fetch metrics');
      }
      const metricsData = (await metricsResponse.json()) as unknown;
      setMetrics((metricsData as { metrics?: ScrapingMetrics }).metrics);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerManualScrape = async () => {
    try {
      setError(undefined);
      const response = await fetch('/api/auto-scrape-initiate', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to trigger manual scrape');
      }
      setTimeout(() => {
        void fetchDashboardData();
      }, 2000);
    } catch (error_) {
      setError(error_ instanceof Error ? error_.message : 'Failed to trigger scrape');
    }
  };

  const getStatusIcon = (status: string) => {
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
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      running: 'default',
      idle: 'secondary',
      error: 'destructive',
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Auto-Scraping Dashboard</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => {
              void fetchDashboardData();
            }}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              void triggerManualScrape();
            }}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Trigger Manual Scrape
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalRuns}</div>
              <p className="text-xs text-muted-foreground">{metrics.successfulRuns} successful</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {metrics.totalRuns > 0
                  ? Math.round((metrics.successfulRuns / metrics.totalRuns) * 100)
                  : 0}
                %
              </div>
              <p className="text-xs text-muted-foreground">{metrics.failedRuns} failed runs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trucks Processed</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalTrucksProcessed}</div>
              <p className="text-xs text-muted-foreground">Total trucks processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Today</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.newTrucksToday}</div>
              <p className="text-xs text-muted-foreground">New trucks found today</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cron Jobs Status */}
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
                <TableRow key={job.id}>
                  <TableCell className="flex items-center gap-2">
                    {getStatusIcon(job.status)}
                    {job.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{job.schedule}</TableCell>
                  <TableCell>{getStatusBadge(job.status)}</TableCell>
                  <TableCell>
                    {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    {job.nextRun ? new Date(job.nextRun).toLocaleString() : 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {job.lastResult ? (
                      <div className="text-sm">
                        <div className={job.lastResult.success ? 'text-green-600' : 'text-red-600'}>
                          {job.lastResult.success ? 'Success' : 'Failed'}
                        </div>
                        {job.lastResult.trucksProcessed && (
                          <div className="text-xs text-muted-foreground">
                            {job.lastResult.trucksProcessed} trucks, {job.lastResult.newTrucksFound}{' '}
                            new
                          </div>
                        )}
                      </div>
                    ) : (
                      'No data'
                    )}
                  </TableCell>
                </TableRow>
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
    </div>
  );
}
