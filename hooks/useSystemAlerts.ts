import { useState, useEffect } from 'react';
import type { RealtimeEvent } from './useRealtimeAdminEvents.types';

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged?: boolean;
}

/**
* Processes recent events and returns a list of system alerts
* @example
* processRecentEvents(recentEvents)
* [SystemAlert, SystemAlert, ...]
* @param {RealtimeEvent[]} recentEvents - Array of recent events to be processed.
* @returns {SystemAlert[]} A list of system alerts, filtered and formatted, based on the severity of the events.
* @description
*   - Filters out events with severity of 'info'.
*   - Assigns a default message if event message is not available.
*   - Ensures returned severity is one of the allowed types ('info', 'warning', 'error', 'critical').
*   - Returns only up to 5 most recent alerts.
*/
function processRecentEvents(recentEvents: RealtimeEvent[]): SystemAlert[] {
  return recentEvents
    .filter((event) => (event.severity ?? 'info') !== 'info') // Handle nullable severity explicitly
    .map((event) => {
      // Explicitly guard event.data and its message property
      const message =
        typeof event.data === 'object' &&
        event.data !== null &&
        'message' in event.data &&
        typeof event.data.message === 'string'
          ? event.data.message
          : 'System event occurred';

      // Explicitly ensure event.severity is one of the allowed types for SystemAlert
      const severity: 'info' | 'warning' | 'error' | 'critical' =
        event.severity === 'info' ||
        event.severity === 'warning' ||
        event.severity === 'error' ||
        event.severity === 'critical'
          ? event.severity
          : 'info'; // Fallback to 'info' if type is unexpected

      return {
        id: event.id,
        type: severity,
        message: message,
        timestamp: event.timestamp,
        acknowledged: false,
      };
    })
    .slice(0, 5); // Keep only the latest 5 alerts
}

/**
* Manages and updates system alerts and controls alert details visibility.
* @example
* useSystemAlerts(recentEvents)
* { alerts: [...], showDetails: false, acknowledgeAlert: [Function], toggleDetails: [Function] }
* @param {RealtimeEvent[]} recentEvents - List of recent events to be processed into alerts.
* @returns {Object} Object containing alerts, showDetails, and handler functions.
* @description
*   - Uses useState to store alerts and the visibility state of alert details.
*   - Prevents unnecessary re-renders by comparing current and new alerts.
*   - Provides a mechanism to acknowledge individual alerts.
*   - Allows toggling of a detailed view of alerts.
*/
export const useSystemAlerts = (recentEvents: RealtimeEvent[]) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const newAlerts = processRecentEvents(recentEvents);

    // Only update if there's a change to avoid unnecessary re-renders
    if (JSON.stringify(newAlerts) !== JSON.stringify(alerts)) {
      setAlerts(newAlerts);
    }
  }, [recentEvents, alerts]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)),
    );
  };

  const toggleDetails = () => {
    setShowDetails((prev) => !prev);
  };

  return {
    alerts,
    showDetails,
    acknowledgeAlert,
    toggleDetails,
  };
};
