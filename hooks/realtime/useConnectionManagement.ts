import { useCallback, useRef } from 'react';
import { AdminEvent, RealtimeMetrics } from '../useRealtimeAdminEvents.types';
import { useConnectionState } from './useConnectionState';
import { createEventSourceConnection } from './createEventSourceConnection';

export function useConnectionManagement(
  eventSourceRef: React.MutableRefObject<EventSource | undefined>,
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>,
  isManuallyDisconnectedRef: React.MutableRefObject<boolean>,
  connectionState: ReturnType<typeof useConnectionState>,
  handleEvent: (event: AdminEvent) => void,
  connectionAttempts: number,
  maxReconnectAttempts: number,
  reconnectInterval: number,
  isConnecting: boolean
) {
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
