import { useState, useEffect, useRef, useCallback } from 'react';
import { AdminEvent, RealtimeMetrics } from './useRealtimeAdminEvents.types';
import { parseEventData, setupEventListeners, setupEventSourceAuth } from './useRealtimeAdminEventsHelpers';

/**
 * SOTA Real-time Admin Dashboard Hook
 * 
 * Provides real-time updates for admin dashboard using Server-Sent Events (SSE)
 * Implements automatic reconnection, error handling, and event filtering
 */

interface UseRealtimeAdminEventsOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  eventFilter?: (event: AdminEvent) => boolean;
}

interface UseRealtimeAdminEventsReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | undefined;
  
  // Data
  latestMetrics: RealtimeMetrics | undefined;
  recentEvents: AdminEvent[];
  
  // Controls
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;
  
  // Statistics
  connectionAttempts: number;
  lastEventTime: Date | undefined;
}

// Connection state management hook
function useConnectionState() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | undefined>(undefined);
  const [latestMetrics, setLatestMetrics] = useState<RealtimeMetrics | undefined>(undefined);
  const [recentEvents, setRecentEvents] = useState<AdminEvent[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<Date | undefined>(undefined);

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

// Helper function to setup event source listeners
function setupEventSourceListeners(
  eventSource: EventSource,
  handleEvent: (event: AdminEvent) => void,
  connectionState: ReturnType<typeof useConnectionState>,
  isManuallyDisconnectedRef: React.MutableRefObject<boolean>,
  connectionAttempts: number,
  maxReconnectAttempts: number,
  reconnectInterval: number,
  reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>,
  connect: () => void
) {
  const { setIsConnected, setIsConnecting, setConnectionError, setConnectionAttempts } = connectionState;

  eventSource.addEventListener('open', () => {
    console.info('Real-time admin events connected');
    setIsConnected(true);
    setIsConnecting(false);
    setConnectionError(undefined);
    setConnectionAttempts(0);
  });

  eventSource.addEventListener('message', (event: MessageEvent) => {
    const adminEvent = parseEventData(event.data as string, 'message');
    if (adminEvent) {
      handleEvent(adminEvent);
    }
  });

  eventSource.addEventListener('error', (error) => {
    console.error('Real-time admin events error:', error);
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError('Connection error occurred');

    // Attempt reconnection if not manually disconnected
    if (!isManuallyDisconnectedRef.current && connectionAttempts < maxReconnectAttempts) {
      setConnectionAttempts(prev => prev + 1);

      reconnectTimeoutRef.current = setTimeout(() => {
        if (!isManuallyDisconnectedRef.current) {
          connect();
        }
      }, reconnectInterval);
    } else if (connectionAttempts >= maxReconnectAttempts) {
      setConnectionError('Max reconnection attempts reached');
    }
  });

  // Handle specific event types
  setupEventListeners(eventSource, handleEvent);
}

// Event source connection management
function createEventSourceConnection({
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
  handleEvent: (event: AdminEvent) => void;
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

// Custom hook for event handling logic
function useEventHandlers(
  eventFilter: ((event: AdminEvent) => boolean) | undefined,
  setLastEventTime: (date: Date) => void,
  setLatestMetrics: (metrics: RealtimeMetrics) => void,
  setRecentEvents: React.Dispatch<React.SetStateAction<AdminEvent[]>>
) {
  return useCallback((event: AdminEvent) => {
    // Apply filter if provided
    if (eventFilter && !eventFilter(event)) {
      return;
    }

    setLastEventTime(new Date());

    // Handle different event types
    switch (event.type) {
      case 'heartbeat': {
        if (event.data != undefined && typeof event.data === 'object') {
          setLatestMetrics(event.data as unknown as RealtimeMetrics);
        }
        break;
      }

      case 'scraping_update':
      case 'data_quality_change':
      case 'system_alert':
      case 'user_activity': {
        setRecentEvents(prev => {
          const newEvents = [event, ...prev].slice(0, 50); // Keep last 50 events
          return newEvents;
        });
        break;
      }
    }
  }, [eventFilter, setLastEventTime, setLatestMetrics, setRecentEvents]);
}

// Custom hook for connection management functions
function useConnectionManagement(
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

// Custom hook for auto-connect effect
function useAutoConnect(
  autoConnect: boolean,
  connect: () => void,
  disconnect: () => void
) {
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);
}

export function useRealtimeAdminEvents(
  options: UseRealtimeAdminEventsOptions = {}
): UseRealtimeAdminEventsReturn {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    eventFilter
  } = options;

  // State management
  const connectionState = useConnectionState();
  const {
    isConnected, setIsConnected,
    isConnecting, setIsConnecting,
    connectionError, setConnectionError,
    latestMetrics, setLatestMetrics,
    recentEvents, setRecentEvents,
    connectionAttempts, setConnectionAttempts,
    lastEventTime, setLastEventTime
  } = connectionState;

  // Refs
  const eventSourceRef = useRef<EventSource | undefined>(undefined);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isManuallyDisconnectedRef = useRef(false);

  // Event handlers
  const handleEvent = useEventHandlers(eventFilter, setLastEventTime, setLatestMetrics, setRecentEvents);

  // Connection management
  const { connect, disconnect, clearEvents } = useConnectionManagement(
    eventSourceRef,
    reconnectTimeoutRef,
    isManuallyDisconnectedRef,
    connectionState,
    handleEvent,
    connectionAttempts,
    maxReconnectAttempts,
    reconnectInterval,
    isConnecting
  );

  // Auto-connect on mount
  useAutoConnect(autoConnect, connect, disconnect);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  return {
    // Connection state
    isConnected,
    isConnecting,
    connectionError,
    
    // Data
    latestMetrics,
    recentEvents,
    
    // Controls
    connect,
    disconnect,
    clearEvents,
    
    // Statistics
    connectionAttempts,
    lastEventTime
  };
}
