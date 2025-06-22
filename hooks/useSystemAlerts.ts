import { useState, useEffect } from 'react';
import { RealtimeEvent } from './useRealtimeAdminEvents.types';

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged?: boolean;
}

export const useSystemAlerts = (recentEvents: RealtimeEvent[]) => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const newAlerts = recentEvents
      .filter(event => event.severity && event.severity !== 'info')
      .map(event => ({
        id: event.id,
        type: event.severity as 'warning' | 'error' | 'critical',
        message: (typeof event.data?.message === 'string' && event.data.message) || 'System event occurred',
        timestamp: event.timestamp,
        acknowledged: false,
      }))
      .slice(0, 5); // Keep only the latest 5 alerts

    // Only update if there's a change to avoid unnecessary re-renders
    if (JSON.stringify(newAlerts) !== JSON.stringify(alerts)) {
      setAlerts(newAlerts);
    }
  }, [recentEvents, alerts]);

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev =>
      prev.map(alert =>
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };

  return {
    alerts,
    showDetails,
    acknowledgeAlert,
    toggleDetails,
  };
};
