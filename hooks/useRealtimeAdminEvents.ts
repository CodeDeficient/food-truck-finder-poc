/**
 * SOTA Real-time Admin Dashboard Hook
 * 
 * Provides real-time updates for admin dashboard using Server-Sent Events (SSE)
 * Implements automatic reconnection, error handling, and event filtering
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// Utility function for parsing event data
function parseEventData(eventData: string, eventType: string): AdminEvent | null {
  try {
    return JSON.parse(eventData) as AdminEvent;
  } catch (error) {
    console.warn(`Failed to parse ${eventType} event:`, error);
    return null;
  }
}

// Setup event listeners for different event types
function setupEventListeners(eventSource: EventSource, handleEvent: (event: AdminEvent) => void) {
  const eventTypes = ['heartbeat', 'scraping_update', 'data_quality_change', 'system_alert'];

  eventTypes.forEach(eventType => {
    eventSource.addEventListener(eventType, (event: MessageEvent) => {
      const adminEvent = parseEventData(event.data as string, eventType);
      if (adminEvent) {
        handleEvent(adminEvent);
      }
    });
  });
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
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Data
  latestMetrics: RealtimeMetrics | null;
  recentEvents: AdminEvent[];
  
  // Controls
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;
  
  // Statistics
  connectionAttempts: number;
  lastEventTime: Date | null;
}

// Connection state management hook
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
    // Get auth token from localStorage or context
    const token = localStorage.getItem('supabase.auth.token') ??
                 sessionStorage.getItem('supabase.auth.token');

    if (token == undefined || token === '') {
      throw new Error('No authentication token available');
    }

    const eventSource = new EventSource('/api/admin/realtime-events');

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

    eventSourceRef.current = eventSource;

  } catch (error) {
    console.error('Failed to establish real-time connection:', error);
    setIsConnecting(false);
    setConnectionError(error instanceof Error ? error.message : 'Connection failed');
  }
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
  const handleEvent = useCallback((event: AdminEvent) => {
    // Apply filter if provided
    if (eventFilter && !eventFilter(event)) {
      return;
    }

    setLastEventTime(new Date());

    // Handle different event types
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
        setRecentEvents(prev => {
          const newEvents = [event, ...prev].slice(0, 50); // Keep last 50 events
          return newEvents;
        });
        break;
      }
    }
  }, [eventFilter]);

  // Connection management
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
  }, []);

  const clearEvents = useCallback(() => {
    setRecentEvents([]);
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

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
