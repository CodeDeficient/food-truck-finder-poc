import React from 'react';
import { RealtimeEvent } from '../useRealtimeAdminEvents.types';
interface RealtimeMetrics {
  scrapingJobs: {
    active: number;
    completed: number;
    failed: number;
    pending: number;
  };
  dataQuality: {
    averageScore: number;
    totalTrucks: number;
    recentChanges: number;
  };
  systemHealth: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    lastUpdate: string;
  };
}
import { setupEventSourceAuth } from '../useRealtimeAdminEventsHelpers';
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

/**
* Initializes a new EventSource connection for real-time events
* @example
* initializeEventSource(config)
* EventSource instance ready to handle real-time events
* @param {CreateConnectionConfig} config - Configuration object containing handlers and settings for the connection.
* @returns {EventSource} Instance of EventSource configured to listen and manage real-time event connections.
* @description
*   - Establishes a connection to '/api/admin/realtime-events' to receive real-time events.
*   - Utilizes setupEventSourceListeners to apply custom event handling logic and reconnect strategies.
*   - Ensures robust management of the connection attempts, with support for maximum retries and configurable intervals.
*   - Facilitates connection state tracking and manual disconnection features through ref objects.
*/
function initializeEventSource(config: CreateConnectionConfig) {
  const {
    handleEvent,
    isManuallyDisconnectedRef,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    reconnectTimeoutRef,
    connect,
    setLastEventTime,
    setLatestMetrics,
    setRecentEvents,
    setIsConnected,
    setIsConnecting,
    setConnectionError,
    setConnectionAttempts,
  } = config;
  const eventSource = new EventSource('/api/admin/realtime-events');

  // Setup all event listeners
  setupEventSourceListeners({
    eventSource,
    handleEvent,
    isManuallyDisconnectedRef,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    reconnectTimeoutRef,
    connect,
    setLastEventTime,
    setLatestMetrics,
    setRecentEvents,
    setIsConnected,
    setIsConnecting,
    setConnectionError,
    setConnectionAttempts,
  });

  return eventSource;
}

function setupInitialConnectionState(
  setIsConnecting: React.Dispatch<React.SetStateAction<boolean>>,
  setConnectionError: React.Dispatch<React.SetStateAction<string | undefined>>,
  isManuallyDisconnectedRef: React.RefObject<boolean>,
) {
  setIsConnecting(true);
  setConnectionError(undefined);
  isManuallyDisconnectedRef.current = false;
}

/**
 * Establishes a new EventSource connection using the provided configuration.
 * @example
 * establishEventSourceConnection({eventSourceRef, connectionState})
 * undefined
 * @param {CreateConnectionConfig} config - Configuration object containing references and connection state management.
 * @returns {undefined} This function does not return a value.
 * @description
 *   - Initializes authentication setup before creating the EventSource connection.
 *   - Handles any errors during the connection process by updating connection state.
 */
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
  connect: () => void;
  setLastEventTime: React.Dispatch<React.SetStateAction<Date | undefined>>;
  setLatestMetrics: React.Dispatch<React.SetStateAction<RealtimeMetrics | undefined>>;
  setRecentEvents: React.Dispatch<React.SetStateAction<RealtimeEvent[]>>;
  setIsConnected: (connected: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | undefined) => void;
  setConnectionAttempts: (attempts: number | ((prev: number) => number)) => void;
}

export function createEventSourceConnection(config: CreateConnectionConfig) {
  const { eventSourceRef, isConnecting, isManuallyDisconnectedRef, setIsConnecting, setConnectionError } = config;

  if (shouldPreventConnection(eventSourceRef, isConnecting)) {
    return;
  }

  setupInitialConnectionState(setIsConnecting, setConnectionError, isManuallyDisconnectedRef);
  establishEventSourceConnection(config);
}
