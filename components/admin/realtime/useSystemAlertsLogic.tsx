import { useState, useEffect } from 'react';
import { type SystemAlert } from './status-helpers';
import { type RealtimeEvent as RealtimeAdminEvent } from '@/hooks/useRealtimeAdminEvents.types';

interface UseSystemAlertsLogicProps {
  readonly recentEvents: RealtimeAdminEvent[];
}

interface UseSystemAlertsLogicReturn {
  alerts: SystemAlert[];
  acknowledgeAlert: (alertId: string) => void;
}

export function useSystemAlertsLogic({ recentEvents }: UseSystemAlertsLogicProps): UseSystemAlertsLogicReturn {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);

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

  const acknowledgeAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, acknowledged: true } : alert)),
    );
  };

  return { alerts, acknowledgeAlert };
}
