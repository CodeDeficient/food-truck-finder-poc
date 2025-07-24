interface ActivityLogEntry {
    type: 'cron_job' | 'manual_scrape' | 'system_event' | 'user_action';
    action: string;
    details: Record<string, unknown>;
    timestamp?: string;
}
/**
* Logs an activity entry with a timestamp and unique ID.
* @example
* logActivity({ action: 'user_login', username: 'johndoe' })
* undefined
* @param {ActivityLogEntry} entry - The activity entry to be logged.
* @returns {void} No return value.
* @description
*   - If `timestamp` is not provided in the entry, the current ISO timestamp is used.
*   - A unique ID is generated and added to the log entry.
*   - Logs activity data to the console in a structured format.
*   - Intended for development, but can be extended for production use with database or monitoring integration.
*/
export declare function logActivity(entry: ActivityLogEntry): void;
export declare function getActivityLogs(_type?: string, _limit?: number): ActivityLogEntry[];
export {};
