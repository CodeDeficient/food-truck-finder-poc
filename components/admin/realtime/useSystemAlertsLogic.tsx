import { useState, useEffect } from 'react';
import { type SystemAlert } from '@/hooks/useSystemAlerts';
import { type RealtimeEvent as RealtimeAdminEvent } from '@/hooks/useRealtimeAdminEvents.types';

interface UseSystemAlertsLogicProps {
  readonly recentEvents: RealtimeAdminEvent[];
}

interface UseSystemAlertsLogicReturn {
  alerts: SystemAlert[];
  acknowledgeAlert: (alertId: string) => void;
}

/**
 * Handles logic for system alerts based on recent events.
 * @example
 * useSystemAlertsLogic({ recentEvents: eventsData })
 * // Returns an object with alerts and acknowledgeAlert function
 * @param {Object} recentEvents - Array of recent event objects to process into alerts.
 * @returns {Object} Object containing current alerts and a function to acknowledge them.
 * @description
 *   - Filters incoming events to create alerts only for those with 'warning', 'error', or 'critical' severities.
 *   - Limits the number of processed alerts to the 5 most recent.
 *   - Provides a method to mark alerts as acknowledged.
 */
export function useSystemAlertsLogic({
  recentEvents,
}: UseSystemAlertsLogicProps): UseSystemAlertsLogicReturn {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

  useEffect(() => {
    const newAlerts = recentEvents
      .filter(
        (event: RealtimeAdminEvent) => event.severity !== undefined && event.severity !== 'info',
      )
      .map((event: RealtimeAdminEvent) => ({
        id: event.id,
        type: event.severity as 'warning' | 'error' | 'critical',
        message:
          typeof event.data.message === 'string'
            ? event.data.message
            : 'System event occurred',
        timestamp: event.timestamp,
        acknowledged: false,
      }))
      .slice(0, 5);
    setAlerts(newAlerts);
  }, [recentEvents]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)),
    );
  };

  return { alerts, acknowledgeAlert };
}
