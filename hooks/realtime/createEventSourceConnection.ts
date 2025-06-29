import React from 'react';
import { RealtimeEvent } from '../useRealtimeAdminEvents.types';
import { setupEventSourceAuth } from '../useRealtimeAdminEventsHelpers';
import { useConnectionState } from './useConnectionState';
import { setupEventSourceListeners } from './setupEventSourceListeners';

function handleConnectionError(error: unknown, setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>, setConnectionError: React.Dispatch<React.SetStateAction<string | undefined>>) {
  console.error('Failed to establish real-time connection:', error);
  setIsConnecting(false);
  setConnectionError((error instanceof Error ? error.message : 'Connection failed'));
}

function initializeEventSource(config: CreateConnectionConfig) {
  const {
    handleEvent,
    connectionState,
    isManuallyDisconnectedRef,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    reconnectTimeoutRef,
    connect,
  } = config;
  const eventSource = new EventSource('/api/admin/realtime-events');

  // Setup all event listeners
  setupEventSourceListeners({
    eventSource,
    handleEvent,
    connectionState,
    isManuallyDisconnectedRef,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    reconnectTimeoutRef,
    connect,
  });

  return eventSource;
}

function setupInitialConnectionState(
  connectionState: ReturnType<typeof useConnectionState>,
  // eslint-disable-next-line sonarjs/deprecation -- MutableRefObject is used intentionally here for mutable ref values.
  isManuallyDisconnectedRef: React.MutableRefObject<boolean | null>
) {
  const { setIsConnecting, setConnectionError } = connectionState; // Removed unused setIsConnected, setConnectionAttempts
  setIsConnecting(true);
  setConnectionError(undefined);
  if (isManuallyDisconnectedRef.current !== undefined) { // Ensure current is not undefined before assigning
    isManuallyDisconnectedRef.current = false;
  }
}

function establishEventSourceConnection(config: CreateConnectionConfig) {
  const { eventSourceRef, connectionState } = config;
  try {
    setupEventSourceAuth();
    if (eventSourceRef.current !== undefined) { // Ensure current is not undefined before assigning
      eventSourceRef.current = initializeEventSource(config);
    }
  } catch (error) {
    handleConnectionError(error, connectionState.setIsConnecting, connectionState.setConnectionError);
  }
}

// eslint-disable-next-line sonarjs/deprecation -- MutableRefObject is used intentionally here for mutable ref values.
function shouldPreventConnection(eventSourceRef: React.MutableRefObject<EventSource | undefined | null>, isConnecting: boolean): boolean {
  return !!eventSourceRef.current || isConnecting;
}

interface CreateConnectionConfig {
  // eslint-disable-next-line sonarjs/deprecation -- MutableRefObject is used intentionally here for mutable ref values.
  eventSourceRef: React.MutableRefObject<EventSource | undefined | null>;
  isConnecting: boolean;
  // eslint-disable-next-line sonarjs/deprecation -- MutableRefObject is used intentionally here for mutable ref values.
  isManuallyDisconnectedRef: React.MutableRefObject<boolean | null>;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  // eslint-disable-next-line sonarjs/deprecation -- MutableRefObject is used intentionally here for mutable ref values.
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined | null>;
  handleEvent: (event: RealtimeEvent) => void;
  connectionState: ReturnType<typeof useConnectionState>;
  connect: () => void;
}

export function createEventSourceConnection(config: CreateConnectionConfig) {
  const { eventSourceRef, isConnecting, connectionState, isManuallyDisconnectedRef } = config;

  if (shouldPreventConnection(eventSourceRef, isConnecting)) {
    return;
  }

  setupInitialConnectionState(connectionState, isManuallyDisconnectedRef);
  establishEventSourceConnection(config);
}
