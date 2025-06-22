import React from 'react';
import { RealtimeEvent, RealtimeMetrics } from '../useRealtimeAdminEvents.types';
import { parseEventData, setupEventListeners, setupEventSourceAuth } from '../useRealtimeAdminEventsHelpers';
import { useConnectionState } from './useConnectionState';
import { setupEventSourceListeners } from './setupEventSourceListeners';

export function createEventSourceConnection({
  eventSourceRef,
  isConnecting,
  isManuallyDisconnectedRef,
  connectionAttempts,
  maxReconnectAttempts,
  reconnectInterval,
  reconnectTimeoutRef,
  handleEvent,
  connectionState,
  connect
}: {
  eventSourceRef: React.MutableRefObject<EventSource | undefined>;
  isConnecting: boolean;
  isManuallyDisconnectedRef: React.MutableRefObject<boolean>;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
  handleEvent: (event: RealtimeEvent) => void;
  connectionState: ReturnType<typeof useConnectionState>;
  connect: () => void;
}) {
  if (eventSourceRef.current || isConnecting) {
    return;
  }

  const { setIsConnecting, setConnectionError, setIsConnected, setConnectionAttempts } = connectionState;

  setIsConnecting(true);
  setConnectionError(undefined);
  isManuallyDisconnectedRef.current = false;

  try {
    // Setup authentication
    setupEventSourceAuth();

    const eventSource = new EventSource('/api/admin/realtime-events');

    // Setup all event listeners
    setupEventSourceListeners(
      eventSource,
      handleEvent,
      connectionState,
      isManuallyDisconnectedRef,
      connectionAttempts,
      maxReconnectAttempts,
      reconnectInterval,
      reconnectTimeoutRef,
      connect
    );

    eventSourceRef.current = eventSource;

  } catch (error) {
    console.error('Failed to establish real-time connection:', error);
    setIsConnecting(false);
    setConnectionError(error instanceof Error ? error.message : 'Connection failed');
  }
}
