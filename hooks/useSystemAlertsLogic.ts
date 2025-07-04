import { useState, useEffect } from 'react';
import { RealtimeEvent } from '@/hooks/useRealtimeAdminEvents.types';

export interface SystemAlert {
  // Added export keyword
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged?: boolean;
}

/**
 * Manages system alerts based on recent events and provides logic for displaying and acknowledging alerts.
 * @example
 * useSystemAlertsLogic(recentEvents)
 * {
 *   alerts: [...],
 *   showDetails: false,
 *   setShowDetails: (newValue) => void,
 *   acknowledgeAlert: (alertId) => void
 * }
 * @param {RealtimeEvent[]} recentEvents - Array of recent real-time events containing severity levels and other data.
 * @returns {object} An object containing alerts array, showDetails state, a setter for showDetails, and a function to acknowledge alerts.
 * @description
 *   - Filters events with severity levels of 'warning', 'error', or 'critical'.
 *   - Transforms events into alert objects with a default message when none is provided.
 *   - Limits the number of alerts to the 5 most recent non-informational events.
 *   - Provides functionality to mark alerts as acknowledged.
 */
export function useSystemAlertsLogic(recentEvents: RealtimeEvent[]) {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const newAlerts = recentEvents
      .filter((event) => event.severity !== undefined && event.severity !== 'info')
      .map((event) => ({
        id: event.id,
        type: event.severity as 'warning' | 'error' | 'critical',
        message:
          typeof event.data.message === 'string' && event.data.message.length > 0
            ? event.data.message
            : 'System event occurred',
        timestamp: event.timestamp,
        acknowledged: false,
      }))
      .slice(0, 5); // Keep only latest 5 alerts

    setAlerts(newAlerts);
  }, [recentEvents]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)),
    );
  };

  return {
    alerts,
    showDetails,
    setShowDetails,
    acknowledgeAlert,
  };
}
