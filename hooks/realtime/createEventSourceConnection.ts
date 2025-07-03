import React from 'react';
import { RealtimeEvent } from '../useRealtimeAdminEvents.types';
import { setupEventSourceAuth } from '../useRealtimeAdminEventsHelpers';
import { useConnectionState } from './useConnectionState';
import { setupEventSourceListeners } from './setupEventSourceListeners';

function handleConnectionError(
  error: unknown,
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setConnectionError: React.Dispatch<React.SetStateAction<string | undefined>>,
) {
  console.error('Failed to establish real-time connection:', error);
  setIsConnecting(false);
  setConnectionError(error instanceof Error ? error.message : 'Connection failed');
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
  isManuallyDisconnectedRef: React.RefObject<boolean>,
) {
  const { setIsConnecting, setConnectionError } = connectionState;
  setIsConnecting(true);
  setConnectionError(undefined);
  isManuallyDisconnectedRef.current = false;
}

function establishEventSourceConnection(config: CreateConnectionConfig) {
  const { eventSourceRef, connectionState } = config;
  try {
    setupEventSourceAuth();
    eventSourceRef.current = initializeEventSource(config);
  } catch (error) {
    handleConnectionError(
      error,
      connectionState.setIsConnecting,
      connectionState.setConnectionError,
    );
  }
}

function shouldPreventConnection(
  eventSourceRef: React.RefObject<EventSource | undefined>,
  isConnecting: boolean,
): boolean {
  return !!eventSourceRef.current || isConnecting;
}

interface CreateConnectionConfig {
  eventSourceRef: React.RefObject<EventSource | undefined>;
  isConnecting: boolean;
  isManuallyDisconnectedRef: React.RefObject<boolean>;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | undefined>;
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
