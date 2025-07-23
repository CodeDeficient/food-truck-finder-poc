import { useCallback } from 'react';
import { createEventSourceConnection } from './createEventSourceConnection';
import { disconnectEventSource, clearRecentEvents } from './connectionManagementHelpers';
/**
 * Builds a connection configuration object from the provided options and connect function.
 * @example
 * buildConnectionConfig(options, connect)
 * {
 *   eventSourceRef: ...,
 *   isConnecting: ...,
 *   ...
 * }
 * @param {UseConnectionManagementOptions} options - An object containing options for managing the connection.
 * @param {function} connect - A function to initiate the connection process.
 * @returns {object} A connection configuration object containing various properties related to connection management.
 * @description
 *   - Combines the input options and the connect function into a structured object.
 *   - Helps in managing and maintaining connection states.
 *   - Used as part of real-time connection management in hooks.
 */
function buildConnectionConfig(options, connect) {
    return {
        eventSourceRef: options.eventSourceRef,
        isConnecting: options.isConnecting,
        isManuallyDisconnectedRef: options.isManuallyDisconnectedRef,
        connectionAttempts: options.connectionAttempts,
        maxReconnectAttempts: options.maxReconnectAttempts,
        reconnectInterval: options.reconnectInterval,
        reconnectTimeoutRef: options.reconnectTimeoutRef,
        handleEvent: options.handleEvent,
        connect,
        setLastEventTime: options.setLastEventTime,
        setLatestMetrics: options.setLatestMetrics,
        setRecentEvents: options.setRecentEvents,
        setIsConnected: options.setIsConnected,
        setIsConnecting: options.setIsConnecting,
        setConnectionError: options.setConnectionError,
        setConnectionAttempts: options.setConnectionAttempts,
        connectionState: {
            setIsConnecting: options.setIsConnecting,
            setConnectionError: options.setConnectionError,
        },
    };
}
/**
* Manages connection lifecycle including connect, disconnect, and event clearing.
* @example
* useConnectionManagement({
*   connectionState: {
*     setIsConnected: () => {},
*     setIsConnecting: () => {},
*     setConnectionError: () => {},
*     setRecentEvents: () => {}
*   },
*   eventSourceRef: new EventSource(),
*   reconnectTimeoutRef: setTimeout(() => {}, 1000),
*   isManuallyDisconnectedRef: false
* })
* // Returns: { connect: [Function], disconnect: [Function], clearEvents: [Function] }
* @param {UseConnectionManagementOptions} options - Contains connection state and references required for managing connection lifecycle.
* @returns {Object} Object with methods to connect, disconnect and clear events.
* @description
*   - Connect method re-establishes a connection using the current options configuration.
*   - Disconnect method properly cleans up connection state to prevent leaks.
*   - ClearEvents method resets recent events using setRecentEvents function.
*/
export function useConnectionManagement(options) {
    const { setIsConnected, setIsConnecting, setConnectionError, setRecentEvents } = options;
    const connect = useCallback(() => {
        const config = buildConnectionConfig(options, () => connect());
        createEventSourceConnection(config);
    }, [
        options.eventSourceRef,
        options.reconnectTimeoutRef,
        options.isManuallyDisconnectedRef,
        options.handleEvent,
        options.connectionAttempts,
        options.maxReconnectAttempts,
        options.reconnectInterval,
        options.isConnecting,
        options.setLastEventTime,
        options.setLatestMetrics,
        options.setRecentEvents,
        options.setIsConnected,
        options.setIsConnecting,
        options.setConnectionError,
    ]);
    const disconnect = useCallback(() => {
        disconnectEventSource({
            eventSourceRef: options.eventSourceRef,
            reconnectTimeoutRef: options.reconnectTimeoutRef,
            isManuallyDisconnectedRef: options.isManuallyDisconnectedRef,
            setIsConnected,
            setIsConnecting,
            setConnectionError,
        });
    }, [
        options.eventSourceRef,
        options.reconnectTimeoutRef,
        options.isManuallyDisconnectedRef,
        setIsConnected,
        setIsConnecting,
        setConnectionError,
    ]);
    const clearEvents = useCallback(() => {
        clearRecentEvents(setRecentEvents);
    }, [setRecentEvents]);
    return { connect, disconnect, clearEvents };
}
