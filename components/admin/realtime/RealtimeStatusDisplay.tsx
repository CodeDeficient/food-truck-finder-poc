import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ConnectionStatusHeader } from './ConnectionStatusHeader';
import { SystemMetricsGrid } from './SystemMetricsGrid';
import { ScrapingJobsStatus } from './ScrapingJobsStatus';
import { SystemAlerts } from './SystemAlerts';
import { EventControls } from './EventControls';
import { type SystemAlert } from './StatusHelpers';
import { type StatusMetric } from './useSystemMetrics';
import { type RealtimeEvent } from '@/hooks/useRealtimeAdminEvents.types';

interface RealtimeStatusDisplayProps {
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly connectionError: string | undefined;
  readonly lastEventTime: Date | undefined;
  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly systemMetrics: StatusMetric[];
  readonly scrapingJobs: {
    active: number;
    completed: number;
    failed: number;
    pending: number;
  } | undefined;
  readonly alerts: SystemAlert[];
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
  readonly onAcknowledgeAlert: (alertId: string) => void;
  readonly recentEventsCount: number;
  readonly onClearEvents: () => void;
}

export function RealtimeStatusDisplay({
  isConnected,
  isConnecting,
  connectionError,
  lastEventTime,
  connect,
  disconnect,
  systemMetrics,
  scrapingJobs,
  alerts,
  showDetails,
  onToggleDetails,
  onAcknowledgeAlert,
  recentEventsCount,
  onClearEvents,
}: RealtimeStatusDisplayProps) {
  return (
    <div className="space-y-4">
      <Card className={`border-l-4 ${isConnected ? 'border-l-green-500' : 'border-l-red-500'}`}>
        <ConnectionStatusHeader
          isConnected={isConnected}
          isConnecting={isConnecting}
          lastEventTime={lastEventTime ? new Date(lastEventTime) : undefined}
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
          />
          <ScrapingJobsStatus scrapingJobs={scrapingJobs} />
          <SystemAlerts
            alerts={alerts}
            showDetails={showDetails}
            onToggleDetails={onToggleDetails}
            onAcknowledgeAlert={onAcknowledgeAlert}
          />
          <EventControls
            recentEventsCount={recentEventsCount}
            onClearEvents={onClearEvents}
          />
        </CardContent>
      </Card>
    </div>
  );
}
