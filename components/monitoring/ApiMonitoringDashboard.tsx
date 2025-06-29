import React, { useEffect, useState } from 'react';

interface APIUsageData {
  success: boolean;
  data: Record<string, unknown>; // Changed from any to Record<string, unknown>
  timestamp: string;
}

export function ApiMonitoringDashboard() {
  const [usage, setUsage] = useState<APIUsageData | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
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
        {/* eslint-disable-next-line unicorn/no-null -- null is standard for JSON.stringify replacer */}
        {JSON.stringify(usage.data, null, 2)}
      </pre>
      <div className="text-xs text-muted-foreground mt-2">Last updated: {usage.timestamp}</div>
    </div>
  );
}
