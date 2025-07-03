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
