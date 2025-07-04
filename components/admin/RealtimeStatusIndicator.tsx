'use client';

/**
 * SOTA Real-time Status Indicator Component
 *
 * Provides visual real-time status updates for admin dashboard
 * with animated indicators, health scores, and alert notifications
 */

import React, { useState } from 'react';
import { useRealtimeAdminEvents } from '@/hooks/useRealtimeAdminEvents';
import { useSystemMetrics } from './realtime/useSystemMetrics';
import { useSystemAlertsLogic } from './realtime/useSystemAlertsLogic';
import { RealtimeStatusDisplay } from './realtime/RealtimeStatusDisplay';

/**
 * Displays the real-time status of system metrics and events.
 * @example
 * RealtimeStatusIndicator()
 * // Returns a JSX component displaying connection status, system metrics, alerts, and events.
 * @returns {JSX.Element} A component providing visual indicators for connection status, metrics, alerts, and the ability to manage events.
 * @description
 *   - Connects automatically with configurations for reconnection attempts and intervals.
 *   - Manages alerts and recent events with acknowledgement and clearing capabilities.
 *   - Utilizes hooks to derive system metrics and alert logic.
 */
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
    lastEventTime,
  } = useRealtimeAdminEvents({
    autoConnect: true,
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
  });

  const { alerts, acknowledgeAlert } = useSystemAlertsLogic({ recentEvents });
  const [showDetails, setShowDetails] = useState(false);

  const systemMetrics = useSystemMetrics({
    isConnected,
    isConnecting,
    connectionError,
    latestMetrics,
  });

  return (
    <RealtimeStatusDisplay
      isConnected={isConnected}
      isConnecting={isConnecting}
      connectionError={connectionError}
      lastEventTime={lastEventTime}
      connect={connect}
      disconnect={disconnect}
      systemMetrics={systemMetrics}
      scrapingJobs={latestMetrics?.scrapingJobs}
      alerts={alerts}
      showDetails={showDetails}
      onToggleDetails={() => setShowDetails(!showDetails)}
      onAcknowledgeAlert={acknowledgeAlert}
      recentEventsCount={recentEvents.length}
      onClearEvents={clearEvents}
    />
  );
}
