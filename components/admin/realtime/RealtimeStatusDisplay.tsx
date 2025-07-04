import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ConnectionStatusHeader } from './ConnectionStatusHeader';
import { SystemMetricsGrid } from './SystemMetricsGrid';
import { ScrapingJobsStatus } from './ScrapingJobsStatus';
import { SystemAlerts } from './SystemAlerts';
import { EventControls } from './EventControls';
import { type SystemAlert } from '@/hooks/useSystemAlerts';
import { type StatusMetric } from './useSystemMetrics';

interface RealtimeStatusDisplayContentProps {
  readonly connectionError: string | undefined;
  readonly systemMetrics: StatusMetric[];
  readonly scrapingJobs:
    | {
        active: number;
        completed: number;
        failed: number;
        pending: number;
      }
    | undefined;
  readonly alerts: SystemAlert[];
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
  readonly onAcknowledgeAlert: (alertId: string) => void;
  readonly recentEventsCount: number;
  readonly onClearEvents: () => void;
}

/**
 * Renders the real-time status display content in the admin panel.
 * @example
 * RealtimeStatusDisplayContent({
 *   connectionError: "Error connecting to server.",
 *   systemMetrics: metricsData,
 *   scrapingJobs: jobsData,
 *   alerts: alertsData,
 *   showDetails: true,
 *   onToggleDetails: toggleDetailsFunction,
 *   onAcknowledgeAlert: acknowledgeAlertFunction,
 *   recentEventsCount: 5,
 *   onClearEvents: clearEventsFunction,
 * })
 * Returns rendered JSX components displaying the real-time status.
 * @param {string | undefined} connectionError - Message indicating connection error if any exists.
 * @param {Object} systemMetrics - Metrics details of the system.
 * @param {Array} scrapingJobs - Current status of scraping jobs.
 * @param {Array} alerts - List of system alerts.
 * @param {boolean} showDetails - Flag indicating whether to show alert details.
 * @param {Function} onToggleDetails - Callback function to toggle details visibility.
 * @param {Function} onAcknowledgeAlert - Callback function to acknowledge an alert.
 * @param {number} recentEventsCount - Count of recent events.
 * @param {Function} onClearEvents - Callback function to clear events.
 * @returns {JSX.Element} JSX content displaying real-time status information.
 * @description
 *   - Displays a connection error message when a connection error exists.
 *   - Integrates multiple components for metrics, alerts, and events.
 *   - Provides control options for detailed view toggling and event clearing.
 *   - Ensures real-time updates on scraping job statuses and system alerts.
 */
function RealtimeStatusDisplayContent({
  connectionError,
  systemMetrics,
  scrapingJobs,
  alerts,
  showDetails,
  onToggleDetails,
  onAcknowledgeAlert,
  recentEventsCount,
  onClearEvents,
}: RealtimeStatusDisplayContentProps) {
  return (
    <CardContent>
      {connectionError !== undefined && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{connectionError}</p>
        </div>
      )}
      <SystemMetricsGrid metrics={systemMetrics} />
      <ScrapingJobsStatus scrapingJobs={scrapingJobs} />
      <SystemAlerts
        alerts={alerts}
        showDetails={showDetails}
        onToggleDetails={onToggleDetails}
        onAcknowledgeAlert={onAcknowledgeAlert}
      />
      <EventControls recentEventsCount={recentEventsCount} onClearEvents={onClearEvents} />
    </CardContent>
  );
}

interface RealtimeStatusDisplayProps {
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly connectionError: string | undefined;
  readonly lastEventTime: Date | undefined;
  readonly connect: () => void;
  readonly disconnect: () => void;
  readonly systemMetrics: StatusMetric[];
  readonly scrapingJobs:
    | {
        active: number;
        completed: number;
        failed: number;
        pending: number;
      }
    | undefined;
  readonly alerts: SystemAlert[];
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
  readonly onAcknowledgeAlert: (alertId: string) => void;
  readonly recentEventsCount: number;
  readonly onClearEvents: () => void;
}

/**
 * Displays the realtime status of a connection with various metrics and controls.
 * @example
 * RealtimeStatusDisplay({
 *   isConnected: false,
 *   isConnecting: true,
 *   connectionError: "Timeout",
 *   lastEventTime: 1638349200000,
 *   connect: () => {},
 *   disconnect: () => {},
 *   systemMetrics: {},
 *   scrapingJobs: [],
 *   alerts: [],
 *   showDetails: false,
 *   onToggleDetails: () => {},
 *   onAcknowledgeAlert: () => {},
 *   recentEventsCount: 5,
 *   onClearEvents: () => {}
 * })
 * <div>...</div>
 * @param {Object} props - Props object containing configuration for the display.
 * @param {boolean} props.isConnected - Connection status, true if currently connected.
 * @param {boolean} props.isConnecting - Connection initiation status, true if attempting to connect.
 * @param {string} props.connectionError - Description of the last encountered connection error.
 * @param {number} props.lastEventTime - Unix timestamp of the last event occurrence.
 * @param {function} props.connect - Function to initiate a connection.
 * @param {function} props.disconnect - Function to terminate the connection.
 * @param {Object} props.systemMetrics - Metrics data related to the system.
 * @param {Array} props.scrapingJobs - List of ongoing or past scraping jobs.
 * @param {Array} props.alerts - Array of alerts that have been triggered.
 * @param {boolean} props.showDetails - Flag to show detailed status information.
 * @param {function} props.onToggleDetails - Callback function to toggle detailed view.
 * @param {function} props.onAcknowledgeAlert - Function to acknowledge a specific alert.
 * @param {number} props.recentEventsCount - Count of recent events to display.
 * @param {function} props.onClearEvents - Callback function to clear the list of events.
 * @returns {JSX.Element} React component rendering the realtime status card.
 * @description
 *   - Utilizes conditional styling to indicate connection status through border color.
 *   - Last event time is formatted and passed as a Date object.
 *   - Component structure comprises a header for status and a content section for metrics and actions.
 */
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
        <RealtimeStatusDisplayContent
          connectionError={connectionError}
          systemMetrics={systemMetrics}
          scrapingJobs={scrapingJobs}
          alerts={alerts}
          showDetails={showDetails}
          onToggleDetails={onToggleDetails}
          onAcknowledgeAlert={onAcknowledgeAlert}
          recentEventsCount={recentEventsCount}
          onClearEvents={onClearEvents}
        />
      </Card>
    </div>
  );
}
