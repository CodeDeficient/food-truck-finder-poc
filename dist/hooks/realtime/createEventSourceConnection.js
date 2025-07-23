import React from 'react';
import { setupEventSourceAuth } from '../useRealtimeAdminEventsHelpers';
import { setupEventSourceListeners } from './setupEventSourceListeners';
function handleConnectionError(error, setIsConnecting, setConnectionError) {
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
function initializeEventSource(config) {
    const { handleEvent, isManuallyDisconnectedRef, connectionAttempts, maxReconnectAttempts, reconnectInterval, reconnectTimeoutRef, connect, setLastEventTime, setLatestMetrics, setRecentEvents, setIsConnected, setIsConnecting, setConnectionError, setConnectionAttempts, } = config;
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
function setupInitialConnectionState(setIsConnecting, setConnectionError, isManuallyDisconnectedRef) {
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
function establishEventSourceConnection(config) {
    const { eventSourceRef, connectionState } = config;
    try {
        setupEventSourceAuth();
        eventSourceRef.current = initializeEventSource(config);
    }
    catch (error) {
        handleConnectionError(error, connectionState.setIsConnecting, connectionState.setConnectionError);
    }
}
function shouldPreventConnection(eventSourceRef, isConnecting) {
    return !!eventSourceRef.current || isConnecting;
}
export function createEventSourceConnection(config) {
    const { eventSourceRef, isConnecting, isManuallyDisconnectedRef, setIsConnecting, setConnectionError } = config;
    if (shouldPreventConnection(eventSourceRef, isConnecting)) {
        return;
    }
    setupInitialConnectionState(setIsConnecting, setConnectionError, isManuallyDisconnectedRef);
    establishEventSourceConnection(config);
}
