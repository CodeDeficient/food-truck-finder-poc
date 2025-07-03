import React from 'react';
import { RealtimeEvent } from '../useRealtimeAdminEvents.types';
import { useConnectionState } from './useConnectionState';

interface ConnectionStateActions {
  setIsConnected: (connected: boolean) => void;
  setIsConnecting: (connecting: boolean) => void;
  setConnectionError: (error: string | undefined) => void;
  setConnectionAttempts: (attempts: number | ((prev: number) => number)) => void;
}

interface EventSourceRefs {
  isManuallyDisconnectedRef: React.RefObject<boolean>;
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | undefined>;
}

interface ReconnectLogicParams extends EventSourceRefs {
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  connect: () => void;
  setConnectionAttempts: (attempts: number | ((prev: number) => number)) => void;
  setConnectionError: (error: string | undefined) => void;
}

const handleOpen = (connectionState: ConnectionStateActions) => () => {
  console.info('Real-time admin events connected');
  connectionState.setIsConnected(true);
  connectionState.setIsConnecting(false);
  connectionState.setConnectionError(undefined);
  connectionState.setConnectionAttempts(0);
};

const handleMessage =
  (
    handleEvent: (event: RealtimeEvent) => void,
    setConnectionError: (error: string | undefined) => void,
  ) =>
  (event: MessageEvent) => {
    try {
      const adminEvent: RealtimeEvent = JSON.parse(event.data as string) as RealtimeEvent;
      handleEvent(adminEvent);
    } catch (error) {
      console.error('Error parsing event data:', error);
      setConnectionError('Error parsing event data');
    }
  };

const handleReconnectLogic = (refs: EventSourceRefs, reconnectParams: ReconnectLogicParams) => {
  if (
    refs.isManuallyDisconnectedRef.current !== true &&
    reconnectParams.connectionAttempts < reconnectParams.maxReconnectAttempts
  ) {
    reconnectParams.setConnectionAttempts((prev) => prev + 1);

    refs.reconnectTimeoutRef.current = setTimeout(() => {
      if (refs.isManuallyDisconnectedRef.current !== true) {
        reconnectParams.connect();
      }
    }, reconnectParams.reconnectInterval);
  } else if (reconnectParams.connectionAttempts >= reconnectParams.maxReconnectAttempts) {
    reconnectParams.setConnectionError('Max reconnection attempts reached');
  }
};

const handleError =
  (
    connectionState: ConnectionStateActions,
    refs: EventSourceRefs,
    reconnectParams: ReconnectLogicParams,
  ) =>
  (error: Event) => {
    console.error('Real-time admin events error:', error);
    connectionState.setIsConnected(false);
    connectionState.setIsConnecting(false);
    connectionState.setConnectionError('Connection error occurred');

    handleReconnectLogic(refs, reconnectParams);
  };

interface SetupEventSourceListenersParams {
  eventSource: EventSource;
  handleEvent: (event: RealtimeEvent) => void;
  connectionState: ReturnType<typeof useConnectionState>;
  isManuallyDisconnectedRef: React.RefObject<boolean>;
  connectionAttempts: number;
  maxReconnectAttempts: number;
  reconnectInterval: number;
  reconnectTimeoutRef: React.RefObject<NodeJS.Timeout | undefined>;
  connect: () => void;
}

function createReconnectLogicParams(
  params: Omit<SetupEventSourceListenersParams, 'eventSource' | 'handleEvent' | 'connectionState'>,
  connectionState: ReturnType<typeof useConnectionState>,
): ReconnectLogicParams {
  return {
    ...params,
    setConnectionAttempts: connectionState.setConnectionAttempts,
    setConnectionError: connectionState.setConnectionError,
  };
}

function addEventListeners(
  eventSource: EventSource,
  params: SetupEventSourceListenersParams,
  connectionActions: ConnectionStateActions,
  reconnectLogicParams: ReconnectLogicParams,
) {
  const { handleEvent, isManuallyDisconnectedRef, reconnectTimeoutRef } = params;
  const refs: EventSourceRefs = { isManuallyDisconnectedRef, reconnectTimeoutRef };

  eventSource.addEventListener('open', handleOpen(connectionActions));
  eventSource.addEventListener(
    'message',
    handleMessage(handleEvent, connectionActions.setConnectionError),
  );
  eventSource.addEventListener('error', handleError(connectionActions, refs, reconnectLogicParams));
}

export function setupEventSourceListeners(params: SetupEventSourceListenersParams) {
  const { eventSource, connectionState } = params;
  const { setIsConnected, setIsConnecting, setConnectionError, setConnectionAttempts } =
    connectionState;
  const connectionActions: ConnectionStateActions = {
    setIsConnected,
    setIsConnecting,
    setConnectionError,
    setConnectionAttempts,
  };
  const reconnectLogicParams = createReconnectLogicParams(params, connectionState);

  addEventListeners(eventSource, params, connectionActions, reconnectLogicParams);
}
