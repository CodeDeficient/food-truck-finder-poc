/**
 * SOTA Real-time Admin Dashboard Hook
 * 
 * Provides real-time updates for admin dashboard using Server-Sent Events (SSE)
 * Implements automatic reconnection, error handling, and event filtering
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Utility function for parsing event data
function parseEventData(eventData: string, eventType: string): AdminEvent | undefined {
  try {
    return JSON.parse(eventData) as AdminEvent;
  } catch (error) {
    console.warn(`Failed to parse ${eventType} event:`, error);
    return undefined;
  }
}

// Setup event listeners for different event types (global scope)
function globalSetupEventListeners(eventSource: EventSource, handleEvent: (event: AdminEvent) => void) {
  const eventTypes = ['heartbeat', 'scraping_update', 'data_quality_change', 'system_alert'];

  for (const eventType of eventTypes) {
    eventSource.addEventListener(eventType, (event: MessageEvent) => {
      const adminEvent = parseEventData(event.data as string, eventType);
      if (adminEvent) {
        handleEvent(adminEvent);
      }
    });
  }
}

interface AdminEvent {
  id: string;
  type: 'scraping_update' | 'data_quality_change' | 'system_alert' | 'user_activity' | 'heartbeat';
  timestamp: string;
  data: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}

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

interface UseRealtimeAdminEventsOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  eventFilter?: (event: AdminEvent) => boolean;
}

interface UseRealtimeAdminEventsReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  latestMetrics: RealtimeMetrics | null;
  recentEvents: AdminEvent[];
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;
  connectionAttempts: number;
  lastEventTime: Date | null;
}

function useConnectionState() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | undefined>();
  const [latestMetrics, setLatestMetrics] = useState<RealtimeMetrics | undefined>();
  const [recentEvents, setRecentEvents] = useState<AdminEvent[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<Date | undefined>();

  return {
    isConnected, setIsConnected,
    isConnecting, setIsConnecting,
    connectionError, setConnectionError,
    latestMetrics, setLatestMetrics,
    recentEvents, setRecentEvents,
    connectionAttempts, setConnectionAttempts,
    lastEventTime, setLastEventTime
  };
}

function setupEventSourceAuth(): string {
  const token = localStorage.getItem('supabase.auth.token') ?? sessionStorage.getItem('supabase.auth.token');
  if (token == undefined || token === '') {
    throw new Error('No authentication token available');
  }
  return token;
}

interface EventSourceListenerOptions {
  eventSource: EventSource;
  handleEvent: (event: AdminEvent) => void;
  connectionState: ReturnType<typeof useConnectionState>;
  isManuallyDisconnectedRef: React.MutableRefObject<boolean>;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
  connect: () => void;
}

function handleOpenEvent(options: EventSourceListenerOptions) {
  options.connectionState.setIsConnected(true);
  options.connectionState.setIsConnecting(false);
  options.connectionState.setConnectionError(undefined);
  options.connectionState.setConnectionAttempts(0);
}

function handleMessageEvent(event: MessageEvent, handleEventFn: (event: AdminEvent) => void) {
  const adminEvent = parseEventData(event.data as string, 'message');
  if (adminEvent) {
    handleEventFn(adminEvent);
  }
}

// Helper for handleErrorEvent
function _attemptReconnectOnEventError(options: EventSourceListenerOptions) {
  if (options.isManuallyDisconnectedRef.current) {
    return; // Do not attempt reconnect if manually disconnected
  }

  if (options.connectionAttempts < options.maxReconnectAttempts) {
    options.connectionState.setConnectionAttempts(prev => prev + 1);
    if (options.reconnectTimeoutRef.current) {
      clearTimeout(options.reconnectTimeoutRef.current);
    }
    options.reconnectTimeoutRef.current = setTimeout(() => {
      // Check again before connecting, in case disconnect was called during timeout
      if (!options.isManuallyDisconnectedRef.current) {
        options.connect(); // This `connect` comes from EventSourceListenerOptions
      }
    }, options.reconnectInterval);
  } else {
    options.connectionState.setConnectionError('Max reconnection attempts reached');
    // No further reconnection attempts
  }
}

function handleErrorEvent(options: EventSourceListenerOptions, error: Event) {
  console.error('Real-time admin events error:', error);
  options.connectionState.setIsConnected(false);
  options.connectionState.setIsConnecting(false);
  options.connectionState.setConnectionError('Connection error occurred');
  _attemptReconnectOnEventError(options);
}

function localSetupEventSourceListeners(options: EventSourceListenerOptions) {
  options.eventSource.addEventListener('open', () => handleOpenEvent(options));
  options.eventSource.addEventListener('message', (event: MessageEvent) => handleMessageEvent(event, options.handleEvent));
  options.eventSource.addEventListener('error', (errorEvent: Event) => handleErrorEvent(options, errorEvent));
  globalSetupEventListeners(options.eventSource, options.handleEvent);
}

interface CreateEventSourceConnectionOptions {
  eventSourceRef: React.MutableRefObject<EventSource | undefined>;
  isConnecting: boolean;
  isManuallyDisconnectedRef: React.MutableRefObject<boolean>;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
  handleEvent: (event: AdminEvent) => void;
  connectionState: ReturnType<typeof useConnectionState>;
  connect: () => void;
}

function establishEventSource(options: CreateEventSourceConnectionOptions) {
  setupEventSourceAuth();
  const eventSource = new EventSource('/api/admin/realtime-events');
  localSetupEventSourceListeners({ eventSource, ...options });
  options.eventSourceRef.current = eventSource;
}

function prepareConnectionStateForAttempt(options: CreateEventSourceConnectionOptions): boolean {
  if (options.eventSourceRef.current || options.isConnecting) {
    return false;
  }
  options.connectionState.setIsConnecting(true);
  options.connectionState.setConnectionError(undefined);
  options.isManuallyDisconnectedRef.current = false;
  return true;
}

function createEventSourceConnection(options: CreateEventSourceConnectionOptions) {
  if (!prepareConnectionStateForAttempt(options)) {
    return;
  }
  try {
    establishEventSource(options);
  } catch (error) {
    console.error('Failed to establish real-time connection:', error);
    options.connectionState.setIsConnecting(false);
    options.connectionState.setConnectionError(error instanceof Error ? error.message : 'Connection failed');
  }
}

function useEventHandlers(
  eventFilter: ((event: AdminEvent) => boolean) | undefined,
  setLastEventTime: (date: Date) => void,
  setLatestMetrics: (metrics: RealtimeMetrics) => void,
  setRecentEvents: React.Dispatch<React.SetStateAction<AdminEvent[]>>
) {
  return useCallback((event: AdminEvent) => {
    if (eventFilter && !eventFilter(event)) {
      return;
    }
    setLastEventTime(new Date());
    switch (event.type) {
      case 'heartbeat': {
        if (event.data != undefined && typeof event.data === 'object') {
          setLatestMetrics(event.data as RealtimeMetrics);
        }
        break;
      }
      case 'scraping_update':
      case 'data_quality_change':
      case 'system_alert':
      case 'user_activity': {
        setRecentEvents(prev => [event, ...prev].slice(0, 50));
        break;
      }
    }
  }, [eventFilter, setLastEventTime, setLatestMetrics, setRecentEvents]);
}

interface ConnectionManagementOptions {
  eventSourceRef: React.MutableRefObject<EventSource | undefined>;
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
  isManuallyDisconnectedRef: React.MutableRefObject<boolean>;
  connectionState: ReturnType<typeof useConnectionState>;
  handleEvent: (event: AdminEvent) => void;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  isConnecting: boolean;
}

function useConnectionManagement(options: ConnectionManagementOptions) {
  const {
    eventSourceRef, reconnectTimeoutRef, isManuallyDisconnectedRef, connectionState,
    handleEvent, connectionAttempts, maxReconnectAttempts, reconnectInterval, isConnecting,
  } = options;
  const { setIsConnected, setIsConnecting, setConnectionError, setRecentEvents } = connectionState;

  const connect = useCallback(() => {
    createEventSourceConnection({ ...options, connect: () => connect() });
  }, [handleEvent, connectionAttempts, maxReconnectAttempts, reconnectInterval, isConnecting, connectionState, options]);

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
  }, [setIsConnected, setIsConnecting, setConnectionError, eventSourceRef, reconnectTimeoutRef, isManuallyDisconnectedRef]);

  const clearEvents = useCallback(() => {
    setRecentEvents([]);
  }, [setRecentEvents]);

  return { connect, disconnect, clearEvents };
}

function useAutoConnect(autoConnect: boolean, connect: () => void, disconnect: () => void) {
  useEffect(() => {
    if (autoConnect) {
      connect();
    }
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);
}

function useRealtimeAdminEventRefs() {
  const eventSourceRef = useRef<EventSource | undefined>(undefined);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isManuallyDisconnectedRef = useRef<boolean>(false);
  return { eventSourceRef, reconnectTimeoutRef, isManuallyDisconnectedRef };
}

function useRealtimeEventsCleanupEffect(
  eventSourceRef: React.MutableRefObject<EventSource | undefined>,
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>
) {
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [eventSourceRef, reconnectTimeoutRef]);
}

export function useRealtimeAdminEvents(
  options: UseRealtimeAdminEventsOptions = {}
): UseRealtimeAdminEventsReturn {
  const { autoConnect = true, reconnectInterval = 5000, maxReconnectAttempts = 10, eventFilter } = options;

  const connectionState = useConnectionState();
  const { eventSourceRef, reconnectTimeoutRef, isManuallyDisconnectedRef } = useRealtimeAdminEventRefs();

  const handleEvent = useEventHandlers(
    eventFilter,
    connectionState.setLastEventTime,
    connectionState.setLatestMetrics,
    connectionState.setRecentEvents
  );

  const connectionManagementOptions: ConnectionManagementOptions = {
    eventSourceRef,
    reconnectTimeoutRef,
    isManuallyDisconnectedRef,
    connectionState,
    handleEvent,
    connectionAttempts: connectionState.connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    isConnecting: connectionState.isConnecting,
  };
  const { connect, disconnect, clearEvents } = useConnectionManagement(connectionManagementOptions);

  useAutoConnect(autoConnect, connect, disconnect);
  useRealtimeEventsCleanupEffect(eventSourceRef, reconnectTimeoutRef);

  return {
    isConnected: connectionState.isConnected,
    isConnecting: connectionState.isConnecting,
    connectionError: connectionState.connectionError,
    latestMetrics: connectionState.latestMetrics,
    recentEvents: connectionState.recentEvents,
    connect,
    disconnect,
    clearEvents,
    connectionAttempts: connectionState.connectionAttempts,
    lastEventTime: connectionState.lastEventTime
  };
}
