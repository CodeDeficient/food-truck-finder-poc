import { useCallback } from 'react';
import { RealtimeEvent, RealtimeMetrics } from '../useRealtimeAdminEvents.types';

/**
 * Handles various types of realtime events, applying filters and updating state accordingly.
 * @example
 * useEventHandlers(
 *   (event) => event.type !== 'heartbeat', 
 *   setLastEventTime, 
 *   setLatestMetrics, 
 *   setRecentEvents
 * )
 * Returns a callback function that can be used to handle incoming realtime events.
 * @param {(event: RealtimeEvent) => boolean | undefined} eventFilter - A function to filter events, only processes events for which this returns true.
 * @param {Function} setLastEventTime - A function to update the last event time with the current timestamp.
 * @param {Function} setLatestMetrics - A function to update the latest metrics data based on the event.
 * @param {React.Dispatch<React.SetStateAction<RealtimeEvent[]>>} setRecentEvents - A state dispatch function to maintain the recent events list, capped at 50 events.
 * @returns {Function} Returns a callback function that processes incoming events based on type and updates states.
 * @description
 *   - Keeps the most recent 50 events in the state.
 *   - Only processes events passing the filter criteria when a filter is provided.
 *   - Different event types are handled by updating specific states or metrics.
 *   - Utilizes React's useCallback for memoization based on dependencies.
 */
export function useEventHandlers(
  eventFilter: ((event: RealtimeEvent) => boolean) | undefined,
  setLastEventTime: React.Dispatch<React.SetStateAction<Date | undefined>>,
  setLatestMetrics: React.Dispatch<React.SetStateAction<RealtimeMetrics | undefined>>,
  setRecentEvents: React.Dispatch<React.SetStateAction<RealtimeEvent[]>>,
) {
  return useCallback(
    (event: RealtimeEvent) => {
      // Apply filter if provided
      if (eventFilter && !eventFilter(event)) {
        return;
      }

      setLastEventTime(new Date());

      // Handle different event types
      switch (event.type) {
        case 'heartbeat': {
          if (event.data != undefined && typeof event.data === 'object') {
            // Type guard for RealtimeMetrics
            function isRealtimeMetrics(obj: unknown): obj is RealtimeMetrics {
              return (
                typeof obj === 'object' &&
                obj !== null &&
                'scrapingJobs' in obj &&
                'dataQuality' in obj &&
                'systemHealth' in obj
              );
            }

            if (isRealtimeMetrics(event.data)) {
              setLatestMetrics(event.data);
            }
          }
          break;
        }

        case 'scraping_update':
        case 'data_quality_change':
        case 'system_alert':
        case 'user_activity': {
          setRecentEvents((prev) => {
            const newEvents = [event, ...prev].slice(0, 50); // Keep last 50 events
            return newEvents;
          });
          break;
        }
      }
    },
    [eventFilter, setLastEventTime, setLatestMetrics, setRecentEvents],
  );
}
