import React from 'react';
import { Wifi, WifiOff, Activity, Server, Database } from 'lucide-react';

export interface StatusMetric {
  readonly label: string;
  readonly value: number | string;
  readonly unit?: string;
  readonly trend?: 'up' | 'down' | 'stable';
  readonly status: 'healthy' | 'warning' | 'error';
  readonly icon: React.ReactNode;
}

export function useSystemMetrics({ isConnected, isConnecting, connectionError, latestMetrics }: {
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly connectionError?: string;
  readonly latestMetrics?: any;
}): StatusMetric[] {
  return [
    {
      label: 'Connection Status',
      value: (() => {
        if (isConnected) return 'Connected';
        if (isConnecting) return 'Connecting...';
        return 'Disconnected';
      })(),
      status: (() => {
        if (isConnected) return 'healthy';
        if (connectionError === undefined) return 'warning';
        return 'error';
      })(),
      icon: isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
    },
    {
      label: 'Active Jobs',
      value: latestMetrics?.scrapingJobs.active ?? 0,
      status: (latestMetrics?.scrapingJobs.active ?? 0) > 0 ? 'healthy' : 'warning',
      icon: <Activity className="h-4 w-4" />
    },
    {
      label: 'System Health',
      value: latestMetrics?.systemHealth.status ?? 'unknown',
      status: (() => {
        const healthStatus = latestMetrics?.systemHealth.status;
        if (healthStatus === 'healthy') return 'healthy';
        if (healthStatus === 'warning') return 'warning';
        return 'error';
      })(),
      icon: <Server className="h-4 w-4" />
    },
    {
      label: 'Data Quality',
      value: latestMetrics?.dataQuality.averageScore ?? 0,
      unit: '%',
      trend: 'stable',
      status: (() => {
        const score = latestMetrics?.dataQuality.averageScore ?? 0;
        if (score >= 80) return 'healthy';
        if (score >= 60) return 'warning';
        return 'error';
      })(),
      icon: <Database className="h-4 w-4" />
    }
  ];
}
