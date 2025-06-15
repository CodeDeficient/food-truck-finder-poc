/**
 * SOTA Real-time Admin Dashboard Hook
 * 
 * Provides real-time updates for admin dashboard using Server-Sent Events (SSE)
 * Implements automatic reconnection, error handling, and event filtering
 */

import { useState, useEffect, useRef, useCallback } from 'react';

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

export function useRealtimeAdminEvents(
  options: UseRealtimeAdminEventsOptions = {}
): UseRealtimeAdminEventsReturn {
  const {
    autoConnect = true,
    reconnectInterval = 5000,
    maxReconnectAttempts = 10,
    eventFilter
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | undefined>();
  const [latestMetrics, setLatestMetrics] = useState<RealtimeMetrics | undefined>();
  const [recentEvents, setRecentEvents] = useState<AdminEvent[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<Date | undefined>();

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
        if (event.data && typeof event.data === 'object') {
          // @ts-expect-error TS(2352): Conversion of type 'Record<string, unknown>' to ty... Remove this comment to see the full error message
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
    if (eventSourceRef.current || isConnecting) {
      return;
    }

    setIsConnecting(true);
    setConnectionError(undefined);
    isManuallyDisconnectedRef.current = false;

    try {
      // Get auth token from localStorage or context
      const token = localStorage.getItem('supabase.auth.token') || 
                   sessionStorage.getItem('supabase.auth.token');

      if (!token) {
        throw new Error('No authentication token available');
      }

      const eventSource = new EventSource('/api/admin/realtime-events', {
        // Note: EventSource doesn't support custom headers directly
        // We'll need to pass the token via query parameter or use a different approach
      });

      eventSource.addEventListener('open', () => {
        console.info('Real-time admin events connected');
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionError(undefined);
        setConnectionAttempts(0);
      });

      eventSource.onmessage = (event) => {
        try {
          const adminEvent: AdminEvent = JSON.parse(event.data);
          handleEvent(adminEvent);
        } catch (error) {
          console.warn('Failed to parse admin event:', error);
        }
      };

      eventSource.onerror = (error) => {
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
      };

      // Handle specific event types
      eventSource.addEventListener('heartbeat', (event) => {
        try {
          const adminEvent: AdminEvent = JSON.parse(event.data);
          handleEvent(adminEvent);
        } catch (error) {
          console.warn('Failed to parse heartbeat event:', error);
        }
      });

      eventSource.addEventListener('scraping_update', (event) => {
        try {
          const adminEvent: AdminEvent = JSON.parse(event.data);
          handleEvent(adminEvent);
        } catch (error) {
          console.warn('Failed to parse scraping update event:', error);
        }
      });

      eventSource.addEventListener('data_quality_change', (event) => {
        try {
          const adminEvent: AdminEvent = JSON.parse(event.data);
          handleEvent(adminEvent);
        } catch (error) {
          console.warn('Failed to parse data quality change event:', error);
        }
      });

      eventSource.addEventListener('system_alert', (event) => {
        try {
          const adminEvent: AdminEvent = JSON.parse(event.data);
          handleEvent(adminEvent);
        } catch (error) {
          console.warn('Failed to parse system alert event:', error);
        }
      });

      eventSourceRef.current = eventSource;

    } catch (error) {
      console.error('Failed to establish real-time connection:', error);
      setIsConnecting(false);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
    }
  }, [handleEvent, connectionAttempts, maxReconnectAttempts, reconnectInterval]);

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
