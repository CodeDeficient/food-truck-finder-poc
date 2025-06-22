import { useState } from 'react';
import { AdminEvent, RealtimeMetrics } from '../useRealtimeAdminEvents.types';

export function useConnectionState() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | undefined>();
  const [latestMetrics, setLatestMetrics] = useState<RealtimeMetrics | undefined>();
  const [recentEvents, setRecentEvents] = useState<AdminEvent[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<Date | undefined>();

  return {
    isConnected, setIsConnected,
    isConnecting, setIsConnecting,
    connectionError, setConnectionError,
    latestMetrics, setLatestMetrics,
    recentEvents, setRecentEvents,
    connectionAttempts, setConnectionAttempts,
    lastEventTime, setLastEventTime
  };
}
