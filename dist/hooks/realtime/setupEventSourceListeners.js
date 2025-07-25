import * as React from 'react';
const handleOpen = (connectionState) => () => {
    console.info('Real-time admin events connected');
    connectionState.setIsConnected(true);
    connectionState.setIsConnecting(false);
    connectionState.setConnectionError(undefined);
    connectionState.setConnectionAttempts(0);
};
const handleMessage = 
/**
* Transforms and handles incoming MessageEvents with error management.
* @example
* ((event, errorHandler) => { parseAndHandleEvent(event)(messageEvent) })(handleEvent, setConnectionError)
* undefined
* @param {function} handleEvent - Function to handle parsed event data as RealtimeEvent.
* @param {function} setConnectionError - Function to handle connection error with an error message string or undefined.
* @returns {function} Returns a function that handles a MessageEvent and manages parsing errors.
* @description
*   - Parses the incoming MessageEvent's data, expecting it to be a JSON string.
*   - Logs parsing errors to the console and updates connection errors.
*   - Uses RealtimeEvent type for processing event data.
*/
(handleEvent, setConnectionError) => (event) => {
    try {
        const adminEvent = JSON.parse(event.data);
        handleEvent(adminEvent);
    }
    catch (error) {
        console.error('Error parsing event data:', error);
        setConnectionError('Error parsing event data');
    }
};
/**
 * Manages reconnection attempts for an event source when disconnected.
 * @example
 * manageReconnection(eventSourceRefs, reconnectLogicParams)
 * undefined
 * @param {EventSourceRefs} refs - Contains current state and timeout references for event source.
 * @param {ReconnectLogicParams} reconnectParams - Holds parameters for reconnect logic such as attempts and intervals.
 * @returns {void} Does not return anything.
 * @description
 *   - Checks if manual disconnection hasn't occurred before attempting reconnection.
 *   - Increments the connection attempts counter with each reconnection try.
 *   - Disconnects and reports an error if maximum reconnection attempts are reached.
 *   - Utilizes a timeout to delay reconnection attempts.
 */
const handleReconnectLogic = (refs, reconnectParams) => {
    if (refs.isManuallyDisconnectedRef.current !== true &&
        reconnectParams.connectionAttempts < reconnectParams.maxReconnectAttempts) {
        reconnectParams.setConnectionAttempts((prev) => prev + 1);
        refs.reconnectTimeoutRef.current = setTimeout(() => {
            if (refs.isManuallyDisconnectedRef.current !== true) {
                reconnectParams.connect();
            }
        }, reconnectParams.reconnectInterval);
    }
    else if (reconnectParams.connectionAttempts >= reconnectParams.maxReconnectAttempts) {
        reconnectParams.setConnectionError('Max reconnection attempts reached');
    }
};
const handleError = 
/**
* Handles real-time admin events error by updating connection state and triggering reconnect logic.
* @example
* const errorHandler = functionName(connectionState, refs, reconnectParams);
* errorHandler(new Event('error'));
* // Logs 'Real-time admin events error:', updates connection state,
* // and initiates reconnect logic.
* @param {ConnectionStateActions} connectionState - Object containing methods to update connection state.
* @param {EventSourceRefs} refs - References related to the event source for handling reconnection.
* @param {ReconnectLogicParams} reconnectParams - Parameters governing the reconnection logic.
* @returns {function} An error handling function that updates connection states and initiates reconnection logic.
* @description
*   - The error handling function logs the error details for debugging purposes.
*   - Ensures connection states are accurately represented when an error occurs.
*   - Calls an external function, `handleReconnectLogic`, to manage reconnection attempts.
*/
(connectionState, refs, reconnectParams) => (error) => {
    console.error('Real-time admin events error:', error);
    connectionState.setIsConnected(false);
    connectionState.setIsConnecting(false);
    connectionState.setConnectionError('Connection error occurred');
    handleReconnectLogic(refs, reconnectParams);
};
function createReconnectLogicParams(params) {
    return {
        eventSource: params.eventSource,
        handleEvent: params.handleEvent,
        isManuallyDisconnectedRef: params.isManuallyDisconnectedRef,
        connectionAttempts: params.connectionAttempts,
        maxReconnectAttempts: params.maxReconnectAttempts,
        reconnectInterval: params.reconnectInterval,
        reconnectTimeoutRef: params.reconnectTimeoutRef,
        connect: params.connect,
        setLastEventTime: params.setLastEventTime,
        setLatestMetrics: params.setLatestMetrics,
        setRecentEvents: params.setRecentEvents,
        setConnectionAttempts: params.setConnectionAttempts,
        setConnectionError: params.setConnectionError,
    };
}
/**
 * Sets up event listeners for an EventSource object to manage events like 'open', 'message', and 'error'.
 * @example
 * addEventListeners(eventSource, params, connectionActions, reconnectLogicParams)
 * Initializes event listeners for handling open, message, and error events of the EventSource.
 * @param {EventSource} eventSource - The EventSource object to attach listeners to.
 * @param {SetupEventSourceListenersParams} params - Contains handlers and references for managing events.
 * @param {ConnectionStateActions} connectionActions - Actions to update connection state based on events.
 * @param {ReconnectLogicParams} reconnectLogicParams - Parameters defining when and how to reconnect.
 * @returns {void} This function does not return any value.
 * @description
 *   - Assumes `handleEvent`, `isManuallyDisconnectedRef`, and `reconnectTimeoutRef` are provided in params to manage event handling and reconnection logic.
 *   - Uses `connectionActions` to update connection state or set error status.
 *   - Integrates `reconnectLogicParams` with error handling to manage automatic reconnections.
 */
function addEventListeners(eventSource, params, connectionActions, reconnectLogicParams) {
    const { handleEvent, isManuallyDisconnectedRef, reconnectTimeoutRef } = params;
    const refs = { isManuallyDisconnectedRef, reconnectTimeoutRef };
    eventSource.addEventListener('open', handleOpen(connectionActions));
    eventSource.addEventListener('message', handleMessage(handleEvent, connectionActions.setConnectionError));
    eventSource.addEventListener('error', handleError(connectionActions, refs, reconnectLogicParams));
}
/**
* Sets up event listeners for an EventSource connection to manage connection state.
* @example
* setupEventSourceListeners({
*   eventSource: new EventSource(url),
*   connectionState: {
*     setIsConnected: (isConnected) => {},
*     setIsConnecting: (isConnecting) => {},
*     setConnectionError: (error) => {},
*     setConnectionAttempts: (attempts) => {},
*   }
* })
* undefined
* @param {SetupEventSourceListenersParams} params - Contains the EventSource and connection state management functions.
* @returns {void} No return value.
* @description
*   - The function abstracts the process of adding appropriate event listeners for the EventSource.
*   - Utilizes `createReconnectLogicParams` to configure parameters for handling reconnection logic.
*   - Encapsulates connection state actions for seamless event handling.
*/
export function setupEventSourceListeners(params) {
    const { eventSource, setIsConnected, setIsConnecting, setConnectionError, setConnectionAttempts } = params;
    const connectionActions = {
        setIsConnected,
        setIsConnecting,
        setConnectionError,
        setConnectionAttempts,
    };
    const reconnectLogicParams = createReconnectLogicParams(params);
    addEventListeners(eventSource, params, connectionActions, reconnectLogicParams);
}
