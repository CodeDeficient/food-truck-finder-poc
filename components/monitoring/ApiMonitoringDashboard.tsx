import React, { useEffect, useState } from 'react';

interface APIUsageData {
  success: boolean;
  data: any;
  timestamp: string;
}

export function ApiMonitoringDashboard() {
  const [usage, setUsage] = useState<APIUsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/monitoring/api-usage');
        if (!res.ok) throw new Error('Failed to fetch API usage');
        const data = await res.json();
        setUsage(data);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  if (loading) return <div>Loading API usage...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;
  if (!usage) return <div>No data available.</div>;

  return (
    <div className="mt-4 p-4 border rounded bg-muted">
      <h2 className="text-lg font-semibold mb-2">API Usage Monitoring</h2>
      <pre className="text-xs bg-background p-2 rounded overflow-x-auto">
        {JSON.stringify(usage.data, null, 2)}
      </pre>
      <div className="text-xs text-muted-foreground mt-2">Last updated: {usage.timestamp}</div>
    </div>
  );
}
