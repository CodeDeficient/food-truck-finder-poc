import React from 'react';
import { RealtimeEvent, RealtimeMetrics } from '../useRealtimeAdminEvents.types';
import { parseEventData, setupEventListeners } from '../useRealtimeAdminEventsHelpers';
import { useConnectionState } from './useConnectionState';

export function setupEventSourceListeners(
  eventSource: EventSource,
  handleEvent: (event: RealtimeEvent) => void,
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
