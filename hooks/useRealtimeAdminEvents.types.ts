// Types extracted for useRealtimeAdminEvents and helpers

export interface RealtimeEvent {
  id: string;
  type: 'scraping_update' | 'data_quality_change' | 'system_alert' | 'user_activity' | 'heartbeat';
  timestamp: string;
  data: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error' | 'critical';
}
