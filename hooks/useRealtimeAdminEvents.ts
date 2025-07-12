import { useRef } from 'react';
import { RealtimeEvent } from './useRealtimeAdminEvents.types';
import { RealtimeMetrics } from '@/lib/types';
import { useConnectionState } from './realtime/useConnectionState';
import { useConnectionManagement } from './realtime/useConnectionManagement';
import { useEventHandlers } from './realtime/useEventHandlers';

/**
 * SOTA Real-time Admin Dashboard Hook
 *
 * Provides real-time updates for admin dashboard using Server-Sent Events (SSE)
 * Implements automatic reconnection, error handling, and event filtering
 */

interface UseRealtimeAdminEventsOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  eventFilter?: (event: RealtimeEvent) => boolean;
}

interface UseRealtimeAdminEventsReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | undefined;

  // Data
  latestMetrics: RealtimeMetrics | undefined;
  recentEvents: RealtimeEvent[];

  // Controls
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;

  // Statistics
  connectionAttempts: number;
  lastEventTime: Date | undefined;
}

export function useRealtimeAdminEvents(
  options: UseRealtimeAdminEventsOptions = {},
): UseRealtimeAdminEventsReturn {
  const { autoConnect = true, reconnectInterval = 5000, maxReconnectAttempts = 10, eventFilter } = options;

  const eventSourceRef = useRef<EventSource>();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const isManuallyDisconnectedRef = useRef(false);

  const {
    isConnected,
    isConnecting,
    connectionError,
    latestMetrics,
    recentEvents,
    connectionAttempts,
    lastEventTime,
    setLastEventTime,
    setLatestMetrics,
    setRecentEvents,
  } = useConnectionState();

  const handleEvent = useEventHandlers(
    eventFilter,
    setLastEventTime,
    setLatestMetrics,
    setRecentEvents,
  );

  const { connect, disconnect, clearEvents } = useConnectionManagement({
    eventSourceRef,
    reconnectTimeoutRef,
    isManuallyDisconnectedRef,
    connectionState,
    handleEvent,
    maxReconnectAttempts,
    reconnectInterval,
  });

  // Auto-connect effect
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    isConnecting,
    connectionError,
    latestMetrics,
    recentEvents,
    connect,
    disconnect,
    clearEvents,
    connectionAttempts,
    lastEventTime,
  };
}
