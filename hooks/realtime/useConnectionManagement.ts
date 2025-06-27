import { useCallback } from 'react';
import { RealtimeEvent } from '../useRealtimeAdminEvents.types';
import { useConnectionState } from './useConnectionState';
import { createEventSourceConnection } from './createEventSourceConnection';
import { disconnectEventSource, clearRecentEvents } from './connectionManagementHelpers';

interface UseConnectionManagementOptions {
  eventSourceRef: React.RefObject<EventSource | undefined>;
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | undefined>;
  isManuallyDisconnectedRef: React.RefObject<boolean>;
  connectionState: ReturnType<typeof useConnectionState>;
  handleEvent: (event: RealtimeEvent) => void;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  isConnecting: boolean;
}

function buildConnectionConfig(options: UseConnectionManagementOptions, connect: () => void) {
  return {
    eventSourceRef: options.eventSourceRef,
    isConnecting: options.isConnecting,
    isManuallyDisconnectedRef: options.isManuallyDisconnectedRef,
    connectionAttempts: options.connectionAttempts,
    maxReconnectAttempts: options.maxReconnectAttempts,
    reconnectInterval: options.reconnectInterval,
    reconnectTimeoutRef: options.reconnectTimeoutRef,
    handleEvent: options.handleEvent,
    connectionState: options.connectionState,
    connect,
  };
}

export function useConnectionManagement(options: UseConnectionManagementOptions) {
  const { connectionState } = options;
  const { setIsConnected, setIsConnecting, setConnectionError, setRecentEvents } = connectionState;

  const connect = useCallback(() => {
    const config = buildConnectionConfig(options, () => connect());
    createEventSourceConnection(config);
  }, [options]);

  const disconnect = useCallback(() => {
    disconnectEventSource({
      eventSourceRef: options.eventSourceRef,
      reconnectTimeoutRef: options.reconnectTimeoutRef,
      isManuallyDisconnectedRef: options.isManuallyDisconnectedRef,
      setIsConnected,
      setIsConnecting,
      setConnectionError
    });
  }, [options.eventSourceRef, options.reconnectTimeoutRef, options.isManuallyDisconnectedRef, setIsConnected, setIsConnecting, setConnectionError]);

  const clearEvents = useCallback(() => {
    clearRecentEvents(setRecentEvents);
  }, [setRecentEvents]);

  return { connect, disconnect, clearEvents };
}
