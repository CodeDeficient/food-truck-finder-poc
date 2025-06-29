import { useEffect, useRef } from 'react';
import { RealtimeEvent, RealtimeMetrics } from '../useRealtimeAdminEvents.types';
import { useConnectionState } from './useConnectionState';
import { useEventHandlers } from './useEventHandlers';
import { useConnectionManagement } from './useConnectionManagement';
import { useAutoConnect } from './useAutoConnect';

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

// eslint-disable-next-line max-lines-per-function -- This hook orchestrates multiple other hooks and manages their state/dependencies.
export function useRealtimeAdminEventsLogic(
  options: UseRealtimeAdminEventsOptions = {}
): UseRealtimeAdminEventsReturn {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    eventFilter
  } = options;

  // State management
  const connectionState = useConnectionState();
  const {
    isConnected,
    isConnecting,
    connectionError,
    latestMetrics,
    recentEvents,
    connectionAttempts,
    lastEventTime
  } = connectionState;

  // Refs
  const eventSourceRef = useRef<EventSource | undefined>(undefined);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isManuallyDisconnectedRef = useRef(false);

  // Event handlers
  const handleEvent = useEventHandlers(
    eventFilter,
    connectionState.setLastEventTime,
    connectionState.setLatestMetrics,
    connectionState.setRecentEvents
  );

  // Connection management
  const { connect, disconnect, clearEvents } = useConnectionManagement(
    eventSourceRef,
    reconnectTimeoutRef,
    isManuallyDisconnectedRef,
    connectionState,
    handleEvent,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    isConnecting
  );

  // Auto-connect on mount
  useAutoConnect(autoConnect, connect, disconnect);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Data
    latestMetrics,
    recentEvents,
    
    // Controls
    connect,
    disconnect,
    clearEvents,
    
    // Statistics
    connectionAttempts,
    lastEventTime
  };
}
