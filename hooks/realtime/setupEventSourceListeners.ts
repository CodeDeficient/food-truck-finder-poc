import React from 'react';
import { RealtimeEvent } from '../useRealtimeAdminEvents.types';
import { parseEventData, setupEventListeners } from '../useRealtimeAdminEventsHelpers';
import { useConnectionState } from './useConnectionState';

export function setupEventSourceListeners(
  eventSource: EventSource,
  handleEvent: (event: RealtimeEvent) => void,
  connectionState: ReturnType<typeof useConnectionState>,
  reconnectionConfig: {
    isManuallyDisconnectedRef: React.MutableRefObject<boolean>;
    connectionAttempts: number;
    maxReconnectAttempts: number;
    reconnectInterval: number;
    reconnectTimeoutRef: React.MutableRefObject<NodeJS.Timeout | undefined>;
    connect: () => void;
  }
) {
  const { setIsConnected, setIsConnecting, setConnectionError, setConnectionAttempts } = connectionState;

  // Extracted listener handlers
  const onOpen = () => {
    console.info('Real-time admin events connected');
    setIsConnected(true);
    setIsConnecting(false);
    setConnectionError(undefined);
    setConnectionAttempts(0);
  };

  const onMessage = (event: MessageEvent) => {
    const adminEvent = parseEventData(event.data as string, 'message');
    if (adminEvent != undefined) {
      handleEvent(adminEvent);
    }
  };

  const onError = (error: Event) => { // Changed error type to Event
    console.error('Real-time admin events error:', error);
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError('Connection error occurred');

    // Attempt reconnection if not manually disconnected
    if (!reconnectionConfig.isManuallyDisconnectedRef.current && reconnectionConfig.connectionAttempts < reconnectionConfig.maxReconnectAttempts) {
      setConnectionAttempts(prev => prev + 1);

      reconnectionConfig.reconnectTimeoutRef.current = setTimeout(() => {
        if (!reconnectionConfig.isManuallyDisconnectedRef.current) {
          reconnectionConfig.connect();
        }
      }, reconnectionConfig.reconnectInterval);
    } else if (reconnectionConfig.connectionAttempts >= reconnectionConfig.maxReconnectAttempts) {
      setConnectionError('Max reconnection attempts reached');
    }
  };

  eventSource.addEventListener('open', onOpen);
  eventSource.addEventListener('message', onMessage);
  eventSource.addEventListener('error', onError);

  // Handle specific event types
  setupEventListeners(eventSource, handleEvent);
}
