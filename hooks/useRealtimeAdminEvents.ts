import { useRealtimeAdminEventsLogic } from './realtime/useRealtimeAdminEventsLogic';
import { RealtimeEvent, RealtimeMetrics } from './useRealtimeAdminEvents.types';

/**
 * SOTA Real-time Admin Dashboard Hook
 * 
 * Provides real-time updates for admin dashboard using Server-Sent Events (SSE)
 * Implements automatic reconnection, error handling, and event filtering
 */

interface UseRealtimeAdminEventsOptions {
  autoConnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  eventFilter?: (event: RealtimeEvent) => boolean;
}

interface UseRealtimeAdminEventsReturn {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | undefined;
  
  // Data
  latestMetrics: RealtimeMetrics | undefined;
  recentEvents: RealtimeEvent[];
  
  // Controls
  connect: () => void;
  disconnect: () => void;
  clearEvents: () => void;
  
  // Statistics
  connectionAttempts: number;
  lastEventTime: Date | undefined;
}

export function useRealtimeAdminEvents(
  options: UseRealtimeAdminEventsOptions = {}
): UseRealtimeAdminEventsReturn {
  return useRealtimeAdminEventsLogic(options);
}
