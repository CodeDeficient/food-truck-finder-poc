import { useState } from 'react';
import { RealtimeEvent, RealtimeMetrics } from '../useRealtimeAdminEvents.types';

/**
 * Provides state management for a real-time connection within a component.
 * @example
 * useConnectionState()
 * {
 *   isConnected: false,
 *   setIsConnected: Function,
 *   isConnecting: false,
 *   setIsConnecting: Function,
 *   connectionError: undefined,
 *   setConnectionError: Function,
 *   latestMetrics: undefined,
 *   setLatestMetrics: Function,
 *   recentEvents: [],
 *   setRecentEvents: Function,
 *   connectionAttempts: 0,
 *   setConnectionAttempts: Function,
 *   lastEventTime: undefined,
 *   setLastEventTime: Function,
 * }
 * @returns {Object} An object containing state values and their setters for connection management.
 * @description
 *   - Tracks connection status as either connected, connecting, or disconnected.
 *   - Keeps track of the count of connection attempts and the time of the last event.
 *   - Holds the latest metrics and recent events pertaining to the real-time connection.
 */
export function useConnectionState() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | undefined>();
  const [latestMetrics, setLatestMetrics] = useState<RealtimeMetrics | undefined>();
  const [recentEvents, setRecentEvents] = useState<RealtimeEvent[]>([]);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<Date | undefined>();

  return {
    isConnected,
    setIsConnected,
    isConnecting,
    setIsConnecting,
    connectionError,
    setConnectionError,
    latestMetrics,
    setLatestMetrics,
    recentEvents,
    setRecentEvents,
    connectionAttempts,
    setConnectionAttempts,
    lastEventTime,
    setLastEventTime,
  };
}
