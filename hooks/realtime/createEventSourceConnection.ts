import React, { MutableRefObject } from 'react'; // Import MutableRefObject
import { RealtimeEvent } from '../useRealtimeAdminEvents.types';
import { setupEventSourceAuth } from '../useRealtimeAdminEventsHelpers';
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
  eventSourceRef: MutableRefObject<EventSource | undefined>; // Use imported MutableRefObject
  isConnecting: boolean;
  isManuallyDisconnectedRef: MutableRefObject<boolean>; // Use imported MutableRefObject
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  reconnectTimeoutRef: MutableRefObject<NodeJS.Timeout | undefined>; // Use imported MutableRefObject
  handleEvent: (event: RealtimeEvent) => void;
  connectionState: ReturnType<typeof useConnectionState>;
  connect: () => void;
}) {
  if (eventSourceRef.current || isConnecting) {
    return;
  }

  const { setIsConnecting, setConnectionError } = connectionState; // Removed unused setIsConnected, setConnectionAttempts

  setIsConnecting(true);
  setConnectionError(undefined);
  isManuallyDisconnectedRef.current = false;

  establishEventSourceConnection(
    eventSourceRef,
    handleEvent,
    connectionState,
    isManuallyDisconnectedRef,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    reconnectTimeoutRef,
    connect
  );
}

function establishEventSourceConnection({
  eventSourceRef,
  handleEvent,
  connectionState,
  isManuallyDisconnectedRef,
  connectionAttempts,
  maxReconnectAttempts,
  reconnectInterval,
  reconnectTimeoutRef,
  connect
}: {
  eventSourceRef: MutableRefObject<EventSource | undefined>;
  handleEvent: (event: RealtimeEvent) => void;
  connectionState: ReturnType<typeof useConnectionState>;
  isManuallyDisconnectedRef: MutableRefObject<boolean>;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  reconnectTimeoutRef: MutableRefObject<NodeJS.Timeout | undefined>;
  connect: () => void;
}) {
  const { setIsConnecting, setConnectionError } = connectionState;
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
