import { useCallback } from 'react';
import { RealtimeEvent } from '../useRealtimeAdminEvents.types';
import { useConnectionState } from './useConnectionState';
import { createEventSourceConnection } from './createEventSourceConnection';

interface UseConnectionManagementOptions {
  eventSourceRef: React.MutableRefObject<EventSource | undefined>;
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
  isManuallyDisconnectedRef: React.MutableRefObject<boolean>;
  connectionState: ReturnType<typeof useConnectionState>;
  handleEvent: (event: RealtimeEvent) => void;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  isConnecting: boolean;
}

export function useConnectionManagement(options: UseConnectionManagementOptions) {
  const {
    eventSourceRef,
    reconnectTimeoutRef,
    isManuallyDisconnectedRef,
    connectionState,
    handleEvent,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    isConnecting
  } = options;

  const { setIsConnected, setIsConnecting, setConnectionError, setRecentEvents } = connectionState;

  const connect = useCallback(() => {
    createEventSourceConnection({
      eventSourceRef,
      isConnecting,
      isManuallyDisconnectedRef,
      connectionAttempts,
      maxReconnectAttempts,
      reconnectInterval,
      reconnectTimeoutRef,
      handleEvent,
      connectionState,
      connect: () => connect()
    });
  }, [handleEvent, connectionAttempts, maxReconnectAttempts, reconnectInterval, isConnecting, connectionState]);

  const disconnect = useCallback(() => {
    isManuallyDisconnectedRef.current = true;

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = undefined;
    }

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = undefined;
    }

    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(undefined);
  }, [setIsConnected, setIsConnecting, setConnectionError]);

  const clearEvents = useCallback(() => {
    setRecentEvents([]);
  }, [setRecentEvents]);

  return { connect, disconnect, clearEvents };
}
