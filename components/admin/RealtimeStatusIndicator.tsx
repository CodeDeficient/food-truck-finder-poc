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
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  RefreshCw, 
  TrendingUp, 
  TrendingDown,
  Zap
} from 'lucide-react';
import { useRealtimeAdminEvents } from '@/hooks/useRealtimeAdminEvents';
import { useSystemMetrics, StatusMetric } from './realtime/useSystemMetrics';
import { AlertToggleButton } from './realtime/AlertToggleButton'; // Import the new component

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
    default: { return null; // Changed to return null
    }
  }
};

// System Metrics Grid Component
interface SystemMetricsGridProps {
  metrics: StatusMetric[];
  getStatusColor: (status: string) => string;
  getStatusIcon: (status: string) => React.ReactNode;
  getTrendIcon: (trend?: string) => React.ReactNode;
}

function SystemMetricsGrid({ metrics, getStatusColor, getStatusIcon, getTrendIcon }: Readonly<SystemMetricsGridProps>) {
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

interface ScrapingJobsMetrics {
  active: number;
  completed: number;
  failed: number;
  pending: number;
}

// Scraping Jobs Status Component
function ScrapingJobsStatus({ scrapingJobs }: Readonly<{ scrapingJobs?: ScrapingJobsMetrics }>) {
  if (scrapingJobs === undefined) return null; // Changed to return null

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

// System Alerts Component
interface SystemAlertsProps {
  alerts: SystemAlert[];
  showDetails: boolean;
  onToggleDetails: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

function getAlertClasses(alertType: SystemAlert['type'], acknowledged?: boolean) {
  let classes = '';
  if (alertType === 'critical') classes = 'border-l-red-500 bg-red-50';
  else if (alertType === 'error') classes = 'border-l-red-400 bg-red-50';
  else classes = 'border-l-yellow-400 bg-yellow-50';

  if (acknowledged === true) classes += ' opacity-50';
  return classes;
}

function SystemAlerts({ alerts, showDetails, onToggleDetails, onAcknowledgeAlert }: Readonly<SystemAlertsProps>) {
  if (alerts.length === 0) return null;
  const visibleAlerts = showDetails ? alerts : alerts.slice(0, 3);
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Alerts</h4>
      <div className="space-y-2">
        {visibleAlerts.map((alert) => (
          <SystemAlertItem
            key={alert.id}
            alert={alert}
            onAcknowledgeAlert={onAcknowledgeAlert}
          />
        ))}
      </div>
      <AlertToggleButton
        alertsLength={alerts.length}
        showDetails={showDetails}
        onToggleDetails={onToggleDetails}
      />
    </div>
  );
}

function SystemAlertItem({ alert, onAcknowledgeAlert }: { alert: SystemAlert; onAcknowledgeAlert: (id: string) => void }) {
  return (
    <div className={`p-2 rounded border-l-4 ${getAlertClasses(alert.type, alert.acknowledged)}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
            {alert.type}
          </Badge>
          <span className="text-sm">{alert.message}</span>
        </div>
        {alert.acknowledged !== true && (
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

// Event Controls Component
interface EventControlsProps {
  recentEventsCount: number;
  onClearEvents: () => void;
}

function EventControls({ recentEventsCount, onClearEvents }: Readonly<EventControlsProps>) {
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
interface ConnectionStatusHeaderProps {
  isConnected: boolean;
  isConnecting: boolean;
  lastEventTime?: Date;
  connect: () => void;
  disconnect: () => void;
}

function ConnectionStatusHeader({
  isConnected,
  isConnecting,
  lastEventTime,
  connect,
  disconnect
}: Readonly<ConnectionStatusHeaderProps>) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Real-time System Status
        </CardTitle>
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
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

// Move SystemAlert type definition above all usages
interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged?: boolean;
}

// Refactor RealtimeStatusIndicator to reduce function size
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

  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const newAlerts = recentEvents
      .filter((event) => event.severity !== undefined && event.severity !== 'info')
      .map((event) => ({
        id: event.id,
        type: event.severity as 'warning' | 'error' | 'critical',
        message:
          typeof event.data.message === 'string' && event.data.message !== ''
            ? event.data.message
            : 'System event occurred',
        timestamp: event.timestamp,
        acknowledged: false,
      }))
      .slice(0, 5);
    setAlerts(newAlerts);
  }, [recentEvents]);

  const systemMetrics = useSystemMetrics({ isConnected, isConnecting, connectionError, latestMetrics });

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)),
    );
  };

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
        <CardContent>
          {connectionError !== undefined && (
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
            recentEventsCount={recentEvents.length}
            onClearEvents={clearEvents}
          />
        </CardContent>
      </Card>
    </div>
  );
}
