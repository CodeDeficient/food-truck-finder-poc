// Utility function for parsing event data
export function parseEventData(eventData, eventType) {
    try {
        return JSON.parse(eventData);
    }
    catch (error) {
        console.warn(`Failed to parse ${eventType} event:`, error);
        return undefined;
    }
}
// Setup event listeners for different event types
/**
 * Set up listeners for specific event types from an EventSource and handle them.
 * @example
 * setupEventListeners(myEventSource, myEventHandlerFunction)
 * undefined
 * @param {EventSource} eventSource - The source of the events to listen for.
 * @param {function} handleEvent - The callback function to handle parsed real-time admin events.
 * @returns {undefined} Function does not return a value.
 * @description
 *   - Listens for the following event types: 'heartbeat', 'scraping_update', 'data_quality_change', 'system_alert'.
 *   - Uses parseEventData to interpret the event data based on its type.
 *   - The handleEvent function is called only if the event data is successfully parsed into a RealtimeEvent.
 */
export function setupEventListeners(eventSource, handleEvent) {
    const eventTypes = ['heartbeat', 'scraping_update', 'data_quality_change', 'system_alert'];
    for (const eventType of eventTypes) {
        eventSource.addEventListener(eventType, (event) => {
            const adminEvent = parseEventData(event.data, eventType);
            if (adminEvent) {
                handleEvent(adminEvent);
            }
        });
    }
}
// Helper function to setup authentication for event source
export function setupEventSourceAuth() {
    const token = localStorage.getItem('supabase.auth.token') ?? sessionStorage.getItem('supabase.auth.token');
    if (token == undefined || token === '') {
        throw new Error('No authentication token available');
    }
    return token;
}
