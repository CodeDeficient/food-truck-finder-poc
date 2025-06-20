'use client';

/**
 * SOTA Real-time Status Indicator Component
 * 
 * Provides visual real-time status updates for admin dashboard
 * with animated indicators, health scores, and alert notifications
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  RefreshCw, 
  Server, 
  TrendingUp, 
  TrendingDown,
  Wifi,
  WifiOff,
  Zap
} from 'lucide-react';
import { useRealtimeAdminEvents } from '@/hooks/useRealtimeAdminEvents';

// Helper function moved to outer scope for consistent function scoping
const getStatusColor = (status: string) => {
  switch (status) {
    case 'healthy': { return 'text-green-600 bg-green-50 border-green-200';
    }
    case 'warning': { return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
    case 'error': { return 'text-red-600 bg-red-50 border-red-200';
    }
    default: { return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
};

// Helper function for status icons
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'healthy': { return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    case 'warning': { return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    case 'error': { return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    default: { return <Clock className="h-4 w-4 text-gray-600" />;
    }
  }
};

// Helper function for trend icons
const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'up': { return <TrendingUp className="h-3 w-3 text-green-600" />;
    }
    case 'down': { return <TrendingDown className="h-3 w-3 text-red-600" />;
    }
    default: { return;
    }
  }
};

interface StatusMetric {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'error';
  icon: React.ReactNode;
}

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged?: boolean;
}

// Custom hook for system metrics calculation
interface SystemMetricsProps {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError?: string;
  latestMetrics?: RealtimeMetrics | null; // More specific type
}

// Define RealtimeMetrics if it's not imported from elsewhere
interface RealtimeMetrics {
  scrapingJobs: {
    active: number;
    completed: number;
    pending: number;
    failed: number;
  };
  systemHealth: { status: string };
  dataQuality: { averageScore: number };
}


function useSystemMetrics({ isConnected, isConnecting, connectionError, latestMetrics }: Readonly<SystemMetricsProps>): StatusMetric[] {
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
        if (connectionError == undefined) return 'warning';
        return 'error';
      })(),
      icon: isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />
    },
    {
      label: 'Active Jobs',
      value: latestMetrics?.scrapingJobs?.active ?? 0,
      status: (latestMetrics?.scrapingJobs?.active ?? 0) > 0 ? 'healthy' : 'warning',
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

// System Metrics Grid Component
function SystemMetricsGrid({ metrics, getStatusColor, getStatusIcon, getTrendIcon }: Readonly<{
  metrics: StatusMetric[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => JSX.Element;
  getTrendIcon: (trend?: string) => React.JSX.Element | undefined; // Corrected JSX Element
}>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border ${getStatusColor(metric.status)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {metric.icon}
              <span className="text-sm font-medium">{metric.label}</span>
            </div>
            {getStatusIcon(metric.status)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {metric.value}{metric.unit}
            </span>
            {getTrendIcon(metric.trend)}
          </div>
        </div>
      ))}
    </div>
  );
}

// Scraping Jobs Status Component
interface ScrapingJobsStatusProps {
  scrapingJobs?: { // Defined a more specific type
    active: number;
    completed: number;
    pending: number;
    failed: number;
  };
}

function ScrapingJobsStatus({ scrapingJobs }: Readonly<ScrapingJobsStatusProps>) {
  if (!scrapingJobs) return; // Changed to falsy check

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

// Single Alert Item Component
function AlertItem({ alert, onAcknowledgeAlert }: Readonly<{ alert: SystemAlert; onAcknowledgeAlert: (alertId: string) => void; }>) {
  const alertTypeClasses = () => {
    if (alert.type === 'critical') return 'border-l-red-500 bg-red-50';
    if (alert.type === 'error') return 'border-l-red-400 bg-red-50';
    return 'border-l-yellow-400 bg-yellow-50';
  };

  return (
    <div
      key={alert.id}
      className={`p-2 rounded border-l-4 ${alertTypeClasses()} ${alert.acknowledged === true ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
            {alert.type}
          </Badge>
          <span className="text-sm">{alert.message}</span>
        </div>
        {alert.acknowledged !== true && ( // Ensure strict boolean check
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAcknowledgeAlert(alert.id)}
          >
            Acknowledge
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {new Date(alert.timestamp).toLocaleString()}
      </p>
    </div>
  );
}

// System Alerts Component
function SystemAlerts({ alerts, showDetails, onToggleDetails, onAcknowledgeAlert }: Readonly<{
  alerts: SystemAlert[];
  showDetails: boolean;
  onToggleDetails: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
}>) {
  if (alerts.length === 0) return; // Changed from return null

  const displayedAlerts = showDetails ? alerts : alerts.slice(0, 3);

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Alerts</h4>
      <div className="space-y-2">
        {displayedAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onAcknowledgeAlert={onAcknowledgeAlert} />
        ))}
      </div>
      {alerts.length > 3 && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={onToggleDetails}
        >
          {showDetails ? 'Hide' : `Show ${alerts.length - 3} more alert(s)`}
        </Button>
      )}
    </div>
  );
}

// Event Controls Component
function EventControls({ recentEventsCount, onClearEvents }: Readonly<{
  recentEventsCount: number;
  onClearEvents: () => void;
}>) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onClearEvents}
        disabled={recentEventsCount === 0}
      >
        Clear Events ({recentEventsCount})
      </Button>
      <Badge variant="secondary">
        {recentEventsCount} events in buffer
      </Badge>
    </div>
  );
}

// Connection Status Header Component
function ConnectionStatusHeader({
  isConnected,
  isConnecting,
  lastEventTime,
  connect,
  disconnect
}: Readonly<{
  isConnected: boolean;
  isConnecting: boolean;
  lastEventTime?: Date;
  connect: () => void;
  disconnect: () => void;
}>) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Real-time System Status
        </CardTitle>
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="flex items-center gap-1 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
            {(() => {
              if (isConnected) return 'Disconnect';
              if (isConnecting) return 'Connecting...';
              return 'Connect';
            })()}
          </Button>
        </div>
      </div>
      {lastEventTime && (
        <p className="text-sm text-muted-foreground">
          Last update: {lastEventTime.toLocaleTimeString()}
        </p>
      )}
    </CardHeader>
  );
}

export function RealtimeStatusIndicator() {
  const {
    isConnected,
    isConnecting,
    connectionError,
    latestMetrics,
    recentEvents,
    connect,
    disconnect,
    clearEvents,
    lastEventTime
  } = useRealtimeAdminEvents({
    autoConnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  });

  const { alerts, acknowledgeAlert, showDetails, setShowDetails } = useProcessedAlerts(recentEvents);
  const systemMetrics = useSystemMetrics({ isConnected, isConnecting, connectionError, latestMetrics });

  return (
    <div className="space-y-4">
      <Card className={`border-l-4 ${isConnected ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <ConnectionStatusHeader
          isConnected={isConnected}
          isConnecting={isConnecting}
          lastEventTime={lastEventTime}
          connect={connect}
          disconnect={disconnect}
        />
        <RealtimeStatusIndicatorContent
          connectionError={connectionError}
          systemMetrics={systemMetrics}
          latestMetrics={latestMetrics}
          alerts={alerts}
          showDetails={showDetails}
          setShowDetails={setShowDetails}
          acknowledgeAlert={acknowledgeAlert}
          recentEventsCount={recentEvents.length}
          clearEvents={clearEvents}
        />
      </Card>
    </div>
  );
}

// Custom hook to manage alert processing and state
function useProcessedAlerts(recentEvents: SystemAlert[]) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const newAlerts = recentEvents
      .filter(event => event.severity != undefined && event.severity != 'info')
      .map(event => {
        // Ensure event.data is treated as a record that might contain a message
        const eventData = event.data as { message?: unknown };
        const message = (typeof eventData?.message === 'string' && eventData.message !== '')
          ? eventData.message
          : 'System event occurred';
        return {
          id: event.id,
          type: event.severity as 'warning' | 'error' | 'critical',
          message: message,
          timestamp: event.timestamp,
          acknowledged: false,
        };
      })
      .slice(0, 5);
    setAlerts(newAlerts);
  }, [recentEvents]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };

  return { alerts, acknowledgeAlert, showDetails, setShowDetails };
}


function RealtimeStatusIndicatorContent({
  connectionError, systemMetrics, latestMetrics, alerts, showDetails, setShowDetails, acknowledgeAlert, recentEventsCount, clearEvents
}: Readonly<{
  connectionError?: string | null;
  systemMetrics: StatusMetric[];
  latestMetrics: RealtimeMetrics | null;
  alerts: SystemAlert[];
  showDetails: boolean;
  setShowDetails: React.Dispatch<React.SetStateAction<boolean>>;
  acknowledgeAlert: (alertId: string) => void;
  recentEventsCount: number;
  clearEvents: () => void;
}>) {
  return (
    <CardContent>
      {connectionError != undefined && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{connectionError}</p>
        </div>
      )}

      <SystemMetricsGrid
        metrics={systemMetrics}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        getTrendIcon={getTrendIcon}
      />

      <ScrapingJobsStatus scrapingJobs={latestMetrics?.scrapingJobs} />

      <SystemAlerts
        alerts={alerts}
        showDetails={showDetails}
        onToggleDetails={() => setShowDetails(!showDetails)}
        onAcknowledgeAlert={acknowledgeAlert}
      />

      <EventControls
        recentEventsCount={recentEventsCount}
        onClearEvents={clearEvents}
      />
    </CardContent>
  );
}
