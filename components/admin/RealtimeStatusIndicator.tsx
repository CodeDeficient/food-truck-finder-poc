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
  WifiOff
} from 'lucide-react';
import { useRealtimeAdminEvents } from '@/hooks/useRealtimeAdminEvents';
import { useSystemMetrics, StatusMetric } from './realtime/useSystemMetrics';
import { ConnectionStatusHeader } from './realtime/ConnectionStatusHeader';
import { getStatusColor, getStatusIcon, getTrendIcon } from './realtime/StatusHelpers';
import { SystemMetricsGrid } from './realtime/SystemMetricsGrid';
import { ScrapingJobsStatus } from './realtime/ScrapingJobsStatus';
import { SystemAlerts } from './realtime/SystemAlerts';
import { EventControls } from './realtime/EventControls';

interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged?: boolean;
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

  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  // Process recent events into alerts
  useEffect(() => {
    const newAlerts = recentEvents
      .filter(event => event.severity !== undefined && event.severity !== 'info')
      .map(event => ({
        id: event.id,
        type: event.severity as 'warning' | 'error' | 'critical',
        message: typeof event.data.message === 'string' && event.data.message !== '' ? event.data.message : 'System event occurred',
        timestamp: event.timestamp,
        acknowledged: false
      }))
      .slice(0, 5); // Keep only latest 5 alerts

    setAlerts(newAlerts);
  }, [recentEvents]);

  const systemMetrics = useSystemMetrics({ isConnected, isConnecting, connectionError, latestMetrics });

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
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
