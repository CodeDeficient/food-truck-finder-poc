'use client';

/**
 * SOTA Real-time Status Indicator Component
 * 
 * Provides visual real-time status updates for admin dashboard
 * with animated indicators, health scores, and alert notifications
 */

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

import { useRealtimeAdminEvents } from '@/hooks/useRealtimeAdminEvents';
import { useSystemMetrics } from './realtime/useSystemMetrics';
import { useSystemAlerts } from '@/hooks/useSystemAlerts';
import { ConnectionStatusHeader } from '@/components/admin/realtime/ConnectionStatusHeader';
import { getStatusColor, getStatusIcon, getTrendIcon } from './realtime/StatusHelpers';
import { SystemMetricsGrid } from './realtime/SystemMetricsGrid';
import { ScrapingJobsStatus } from './realtime/ScrapingJobsStatus';
import { SystemAlerts } from '@/components/admin/realtime/SystemAlerts';
import { EventControls } from './realtime/EventControls';

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

  const systemMetrics = useSystemMetrics({ isConnected, isConnecting, connectionError, latestMetrics });
  const { alerts, showDetails, acknowledgeAlert, toggleDetails } = useSystemAlerts(recentEvents);

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
          {connectionError && (
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
            onToggleDetails={toggleDetails}
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
