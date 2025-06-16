interface ActivityLogEntry {
  type: 'cron_job' | 'manual_scrape' | 'system_event' | 'user_action';
  action: string;
  details: Record<string, unknown>;
  timestamp?: string;
}

export function logActivity(entry: ActivityLogEntry): void {
  try {
    const logEntry = {
      ...entry,
      timestamp: entry.timestamp ?? new Date().toISOString(),
      id: generateId(),
    };

    // Log to console for development
    console.info('Activity Log:', JSON.stringify(logEntry, undefined, 2));

    // In a production environment, you would:
    // 1. Store to database
    // 2. Send to monitoring service
    // 3. Store in a queue for batch processing

    // For now, we'll just store in memory or local storage
    // This is a mock implementation
  } catch (error) {
    console.error('Failed to log activity:', error);
    // Don't throw - logging failures shouldn't break the main flow
  }
}

export function getActivityLogs(_type?: string, _limit: number = 50): ActivityLogEntry[] {
  try {
    // Mock implementation - in production this would query your database
    return [];
  } catch (error) {
    console.error('Failed to retrieve activity logs:', error);
    return [];
  }
}

function generateId(): string {
  // Using crypto.randomUUID() would be better for production, but Math.random() is acceptable for logging IDs
  // eslint-disable-next-line sonarjs/pseudo-random
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
