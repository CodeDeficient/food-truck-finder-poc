// Extracted helpers from useRealtimeAdminEvents.ts for MLPF compliance
import { AdminEvent } from './useRealtimeAdminEvents.types';

// Utility function for parsing event data
export function parseEventData(eventData: string, eventType: string): AdminEvent | undefined {
  try {
    return JSON.parse(eventData) as AdminEvent;
  } catch (error) {
    console.warn(`Failed to parse ${eventType} event:`, error);
    return undefined;
  }
}

// Setup event listeners for different event types
export function setupEventListeners(eventSource: EventSource, handleEvent: (event: AdminEvent) => void) {
  const eventTypes = ['heartbeat', 'scraping_update', 'data_quality_change', 'system_alert'];

  for (const eventType of eventTypes) {
    eventSource.addEventListener(eventType, (event: MessageEvent) => {
      const adminEvent = parseEventData(event.data as string, eventType);
      if (adminEvent) {
        handleEvent(adminEvent);
      }
    });
  }
}

// Helper function to setup authentication for event source
export function setupEventSourceAuth(): string {
  const token = localStorage.getItem('supabase.auth.token') ??
               sessionStorage.getItem('supabase.auth.token');

  if (token == undefined || token === '') {
    throw new Error('No authentication token available');
  }

  return token;
}
