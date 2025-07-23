import { useRef, useEffect } from 'react';
import { useConnectionState } from './realtime/useConnectionState';
import { useConnectionManagement } from './realtime/useConnectionManagement';
import { useEventHandlers } from './realtime/useEventHandlers';
export function useRealtimeAdminEvents(options = {}) {
    const { autoConnect = true, reconnectInterval = 5000, maxReconnectAttempts = 10, eventFilter } = options;
    // Refs for managing connection state - initialized as undefined since
    // the EventSource and timeout will be created/assigned later
    const eventSourceRef = useRef(undefined);
    const reconnectTimeoutRef = useRef(undefined);
    const isManuallyDisconnectedRef = useRef(false);
    const connectionState = useConnectionState();
    const handleEvent = useEventHandlers(eventFilter, connectionState.setLastEventTime, connectionState.setLatestMetrics, connectionState.setRecentEvents);
    const { connect, disconnect, clearEvents } = useConnectionManagement({
        eventSourceRef,
        reconnectTimeoutRef,
        isManuallyDisconnectedRef,
        handleEvent,
        maxReconnectAttempts,
        reconnectInterval,
        connectionAttempts: connectionState.connectionAttempts,
        isConnecting: connectionState.isConnecting,
        setLastEventTime: connectionState.setLastEventTime,
        setLatestMetrics: connectionState.setLatestMetrics,
        setRecentEvents: connectionState.setRecentEvents,
        setIsConnected: connectionState.setIsConnected,
        setIsConnecting: connectionState.setIsConnecting,
        setConnectionError: connectionState.setConnectionError,
        setConnectionAttempts: connectionState.setConnectionAttempts,
    });
    // Auto-connect effect - now useEffect is properly imported and typed
    useEffect(() => {
        if (autoConnect) {
            connect();
        }
        return () => {
            disconnect();
        };
    }, [autoConnect, connect, disconnect]);
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
        lastEventTime: connectionState.lastEventTime,
    };
}
