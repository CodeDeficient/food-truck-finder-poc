import React from 'react';
import { Wifi, WifiOff, Activity, Server, Database } from 'lucide-react';

export interface StatusMetric {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  icon: React.ReactNode;
}

interface LatestMetrics {
  scrapingJobs?: {
    active: number;
    completed: number;
    failed: number;
    pending: number;
  };
  systemHealth?: {
    status: 'healthy' | 'warning' | 'error' | 'unknown';
  };
  dataQuality?: {
    averageScore: number;
  };
}

function getConnectionStatusMetric(
  isConnected: boolean,
  isConnecting: boolean,
  connectionError?: string,
): StatusMetric {
  return {
    label: 'Connection Status',
    value: (() => {
      if (isConnected) return 'Connected';
      if (isConnecting) return 'Connecting...';
      return 'Disconnected';
    })(),
    status: (() => {
      if (isConnected) return 'healthy';
      if (connectionError !== undefined) return 'error';
      return 'healthy';
    })(),
    icon: isConnected ? <Wifi className="size-4" /> : <WifiOff className="size-4" />,
  };
}

function getActiveJobsMetric(latestMetrics?: LatestMetrics): StatusMetric {
  return {
    label: 'Active Jobs',
    value: latestMetrics?.scrapingJobs?.active ?? 0,
    status: (latestMetrics?.scrapingJobs?.active ?? 0) > 0 ? 'healthy' : 'warning',
    icon: <Activity className="size-4" />,
  };
}

function getSystemHealthMetric(latestMetrics?: LatestMetrics): StatusMetric {
  return {
    label: 'System Health',
    value: latestMetrics?.systemHealth?.status ?? 'unknown',
    status: (() => {
      const healthStatus = latestMetrics?.systemHealth?.status;
      if (healthStatus === 'healthy') return 'healthy';
      if (healthStatus === 'warning') return 'warning';
      return 'error';
    })(),
    icon: <Server className="size-4" />,
  };
}

function getDataQualityMetric(latestMetrics?: LatestMetrics): StatusMetric {
  return {
    label: 'Data Quality',
    value: latestMetrics?.dataQuality?.averageScore ?? 0,
    unit: '%',
    trend: 'stable',
    status: (() => {
      const score = latestMetrics?.dataQuality?.averageScore ?? 0;
      if (score >= 80) return 'healthy';
      if (score >= 60) return 'warning';
      return 'error';
    })(),
    icon: <Database className="size-4" />,
  };
}

export function useSystemMetrics({
  isConnected,
  isConnecting,
  connectionError,
  latestMetrics,
}: Readonly<{
  isConnected: boolean;
  isConnecting: boolean;
  connectionError?: string;
  latestMetrics?: LatestMetrics;
}>): StatusMetric[] {
  return [
    getConnectionStatusMetric(isConnected, isConnecting, connectionError),
    getActiveJobsMetric(latestMetrics),
    getSystemHealthMetric(latestMetrics),
    getDataQualityMetric(latestMetrics),
  ];
}
