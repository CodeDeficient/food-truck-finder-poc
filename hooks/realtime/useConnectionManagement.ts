import { useCallback } from 'react'; // useRef is implicitly used by MutableRefObject types
import { RealtimeEvent } from '../useRealtimeAdminEvents.types';
import { useConnectionState } from './useConnectionState';
import { createEventSourceConnection } from './createEventSourceConnection';

interface ConnectionRefs {
  eventSourceRef: React.MutableRefObject<EventSource | undefined>;
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
  isManuallyDisconnectedRef: React.MutableRefObject<boolean>;
}

interface ConnectionConfig {
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  isConnecting: boolean;
}

export function useConnectionManagement(
  refs: ConnectionRefs,
  connectionState: ReturnType<typeof useConnectionState>,
  handleEvent: (event: RealtimeEvent) => void,
  config: ConnectionConfig
) {
  const { setIsConnected, setIsConnecting, setConnectionError, setRecentEvents } = connectionState;
  const { eventSourceRef, reconnectTimeoutRef, isManuallyDisconnectedRef } = refs;
  const { connectionAttempts, maxReconnectAttempts, reconnectInterval, isConnecting } = config;

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
      connect: () => connect() // Pass self to allow re-triggering
    });
  }, [
    handleEvent,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    isConnecting,
    connectionState,
    eventSourceRef,
    isManuallyDisconnectedRef,
    reconnectTimeoutRef
  ]);

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
