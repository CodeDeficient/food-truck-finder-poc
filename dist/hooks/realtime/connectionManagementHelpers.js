/**
 * Disconnects an established EventSource connection and clears relevant references.
 * @example
 * disconnectEventSource({
 *   eventSourceRef: { current: someEventSource },
 *   reconnectTimeoutRef: { current: someTimeout },
 *   isManuallyDisconnectedRef: { current: false },
 *   setIsConnected: updateIsConnectedFunction,
 *   setIsConnecting: updateIsConnectingFunction,
 *   setConnectionError: updateConnectionErrorFunction
 * })
 * undefined
 * @param {Object} disconnectParams - Contains references and state update functions necessary for managing a real-time connection.
 * @param {Object} disconnectParams.eventSourceRef - A ref object that holds the current EventSource instance.
 * @param {Object} disconnectParams.reconnectTimeoutRef - A ref object that carries the identifier for any pending reconnection timeout function.
 * @param {Object} disconnectParams.isManuallyDisconnectedRef - A ref object indicating whether the disconnection was initiated manually.
 * @param {Function} disconnectParams.setIsConnected - Function to update the connection status.
 * @param {Function} disconnectParams.setIsConnecting - Function to update the connecting status.
 * @param {Function} disconnectParams.setConnectionError - Function to set errors during connection.
 * @returns {undefined} No value is returned from this function.
 * @description
 *   - Ensures that all references are properly reset to prevent unintended reconnections or errors.
 *   - Utilizes ref objects to store values across re-renders, promoting efficient state management.
 */
export function disconnectEventSource({ eventSourceRef, reconnectTimeoutRef, isManuallyDisconnectedRef, setIsConnected, setIsConnecting, setConnectionError, }) {
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
}
export function clearRecentEvents(setRecentEvents) {
    setRecentEvents([]);
}
