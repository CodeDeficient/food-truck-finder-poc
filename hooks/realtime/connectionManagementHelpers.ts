import { RealtimeEvent } from '../useRealtimeAdminEvents.types';

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

export function disconnectEventSource({
  eventSourceRef,
  reconnectTimeoutRef,
  isManuallyDisconnectedRef,
  setIsConnected,
  setIsConnecting,
  setConnectionError
}: DisconnectEventSourceParams) {
  (isManuallyDisconnectedRef.current as any) = true;

  if (reconnectTimeoutRef.current) {
    clearTimeout(reconnectTimeoutRef.current);
    (reconnectTimeoutRef.current as any) = undefined;
  }

  if (eventSourceRef.current) {
    eventSourceRef.current.close();
    (eventSourceRef.current as any) = undefined;
  }

  setIsConnected(false);
  setIsConnecting(false);
  setConnectionError(undefined);
}

export function clearRecentEvents(
  setRecentEvents: (events: RealtimeEvent[]) => void
) {
  setRecentEvents([]);
}
