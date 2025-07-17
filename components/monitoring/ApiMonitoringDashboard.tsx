'use client';
import React, { useEffect, useState } from 'react';

interface APIUsageData {
  success: boolean;
  data: Record<string, unknown>; // Changed from any to Record<string, unknown>
  timestamp: string;
}

/**
 * Displays a dashboard for monitoring API usage.
 * @example
 * ApiMonitoringDashboard()
 * <div class="mt-4 p-4 border rounded bg-muted">...</div>
 * @param {none}
 * @returns {JSX.Element} Component displaying API usage data or relevant fallback messages.
 * @description
 *   - Automatically fetches API usage data from a monitoring endpoint.
 *   - Handles loading and error states gracefully within the UI.
 *   - Displays formatted JSON data if available.
 */
export function ApiMonitoringDashboard() {
  const [usage, setUsage] = useState<APIUsageData | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    /**
    * Fetches API usage data and updates the state accordingly.
    * @example
    * fetchUsage()
    * // Sets loading, updates usage data or sets an error message.
    * @param {void} {} - This function does not accept any parameters.
    * @returns {void} This function does not return anything.
    * @description
    *   - It sets the loading state to true before fetching the data and resets it afterward.
    *   - If an error occurs during the data fetching, it captures the error message and updates the error state.
    *   - Utilizes endpoint '/api/monitoring/api-usage' to fetch data.
    */
    async function fetchUsage() {
      setLoading(true);
      setError(undefined);
      try {
        const res = await fetch('/api/monitoring/api-usage');
        if (!res.ok) throw new Error('Failed to fetch API usage');
        const data = (await res.json()) as APIUsageData;
        setUsage(data);
      } catch (error_: unknown) {
        const errorMessage = error_ instanceof Error ? error_.message : String(error_);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }
    void fetchUsage();
  }, []);

  if (loading) return <div>Loading API usage...</div>;
  if (error !== undefined) return <div className="text-red-600">Error: {error}</div>;
  if (usage === undefined) return <div>No data available.</div>;

  return (
    <div className="mt-4 p-4 border rounded bg-muted">
      <h2 className="text-lg font-semibold mb-2">API Usage Monitoring</h2>
      <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
        {JSON.stringify(usage.data, undefined, 2)}
      </pre>
      <div className="text-xs text-muted-foreground mt-2">Last updated: {usage.timestamp}</div>
    </div>
  );
}
