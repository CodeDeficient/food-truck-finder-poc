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

/**
 * Manages real-time admin events connection and state logic.
 * @example
 * useRealtimeAdminEventsLogic({ autoConnect: false })
 * {
 *   isConnected: true,
 *   isConnecting: false,
 *   connectionError: null,
 *   latestMetrics: {},
 *   recentEvents: [],
 *   connect: function,
 *   disconnect: function,
 *   clearEvents: function,
 *   connectionAttempts: 5,
 *   lastEventTime: Date,
 * }
 * @param {UseRealtimeAdminEventsOptions} options - Configuration options for connection logic.
 * @returns {UseRealtimeAdminEventsReturn} An object containing connection state, data, controls, and statistics.
 * @description
 *   - Automatically attempts to connect on mount if autoConnect is true.
 *   - Manages connection state including reconnect logic and event filtering.
 *   - Provides controls for manual connection management.
 *   - Cleans up resources, such as event sources, on component unmount.
 */
export function useRealtimeAdminEventsLogic(
  options: UseRealtimeAdminEventsOptions = {},
): UseRealtimeAdminEventsReturn {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    eventFilter,
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
    lastEventTime,
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
    connectionState.setRecentEvents,
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
    isConnecting,
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
    lastEventTime,
  };
}
