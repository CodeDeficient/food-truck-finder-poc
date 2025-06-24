import { useCallback } from 'react';
import { RealtimeEvent, RealtimeMetrics } from '../useRealtimeAdminEvents.types';

export function useEventHandlers(
  eventFilter: ((event: RealtimeEvent) => boolean) | undefined,
  setLastEventTime: (date: Date) => void,
  setLatestMetrics: (metrics: RealtimeMetrics) => void,
  setRecentEvents: React.Dispatch<React.SetStateAction<RealtimeEvent[]>>
) {
  return useCallback((event: RealtimeEvent) => {
    // Apply filter if provided
    if (eventFilter && !eventFilter(event)) {
      return;
    }

    setLastEventTime(new Date());

    // Handle different event types
    switch (event.type) {
      case 'heartbeat': {
        if (event.data != undefined && typeof event.data === 'object') {
          setLatestMetrics(event.data as unknown as RealtimeMetrics);
        }
        break;
      }

      case 'scraping_update':
      case 'data_quality_change':
      case 'system_alert':
      case 'user_activity': {
        setRecentEvents(prev => {
          const newEvents = [event, ...prev].slice(0, 50); // Keep last 50 events
          return newEvents;
        });
        break;
      }
    }
  }, [eventFilter, setLastEventTime, setLatestMetrics, setRecentEvents]);
}
