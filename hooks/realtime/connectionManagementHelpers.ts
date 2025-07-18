import type { RealtimeEvent } from '../useRealtimeAdminEvents.types';

// NOTE: React.MutableRefObject is flagged as deprecated by some linters, but is still the standard type for refs created by useRef in React 18+.
// See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/66808

interface DisconnectEventSourceParams {
  eventSourceRef: React.RefObject<EventSource | undefined>;
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | undefined>;
  isManuallyDisconnectedRef: React.RefObject<boolean>;
  setIsConnected: (connected: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | undefined) => void;
}

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
export function disconnectEventSource({
  eventSourceRef,
  reconnectTimeoutRef,
  isManuallyDisconnectedRef,
  setIsConnected,
  setIsConnecting,
  setConnectionError,
}: DisconnectEventSourceParams) {
  isManuallyDisconnectedRef.current = true;

  if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current);
    (reconnectTimeoutRef.current as NodeJS.Timeout | undefined) = undefined;
  }

  if (eventSourceRef.current) {
    eventSourceRef.current.close();
    (eventSourceRef.current as EventSource | undefined) = undefined;
  }

  setIsConnected(false);
  setIsConnecting(false);
  setConnectionError(undefined);
}

export function clearRecentEvents(setRecentEvents: (events: RealtimeEvent[]) => void) {
  setRecentEvents([]);
}
