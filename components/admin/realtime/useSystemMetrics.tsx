
import { Wifi, WifiOff, Activity, Server, Database } from 'lucide-react';

export interface StatusMetric {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  icon: React.ReactNode;
}

interface LatestMetrics {
  scrapingJobs?: {
    active: number;
    completed: number;
    failed: number;
    pending: number;
  };
  systemHealth?: {
    status: 'healthy' | 'warning' | 'error' | 'unknown';
  };
  dataQuality?: {
    averageScore: number;
  };
}

/**
* Returns a connection status metric object based on connection parameters.
* @example
* getConnectionStatusMetric(true, false, 'Network error')
* { label: 'Connection Status', value: 'Connected', status: 'healthy', icon: <Wifi className="size-4" /> }
* @param {boolean} isConnected - Indicates if the system is currently connected.
* @param {boolean} isConnecting - Indicates if the system is in the process of connecting.
* @param {string} [connectionError] - Optional error message if a connection attempt failed.
* @returns {StatusMetric} An object containing label, value, status, and icon related to connection status.
* @description
*   - The status property is determined by both connection state and presence of connection error.
*   - Automatically selects an icon based on connection status.
*/
function getConnectionStatusMetric(
  isConnected: boolean,
  isConnecting: boolean,
  connectionError?: string,
): StatusMetric {
  return {
    label: 'Connection Status',
    value: (() => {
      if (isConnected) return 'Connected';
      if (isConnecting) return 'Connecting...';
      return 'Disconnected';
    })(),
    status: (() => {
      if (isConnected) return 'healthy';
      if (connectionError !== undefined) return 'error';
      return 'healthy';
    })(),
    icon: isConnected ? <Wifi className="size-4" /> : <WifiOff className="size-4" />,
  };
}

function getActiveJobsMetric(latestMetrics?: LatestMetrics): StatusMetric {
  return {
    label: 'Active Jobs',
    value: latestMetrics?.scrapingJobs?.active ?? 0,
    status: (latestMetrics?.scrapingJobs?.active ?? 0) > 0 ? 'healthy' : 'warning',
    icon: <Activity className="size-4" />,
  };
}

/**
 * Retrieves the system health metric based on the latest metrics provided.
 * @example
 * getSystemHealthMetric({ systemHealth: { status: 'healthy' } })
 * Returns: { label: 'System Health', value: 'healthy', status: 'healthy', icon: JSX.Element }
 * @param {LatestMetrics} [latestMetrics] - The latest metrics object containing system health information.
 * @returns {StatusMetric} An object containing the system health status, label, value, and icon.
 * @description
 *   - Defaults to 'unknown' if health status is not provided in latestMetrics.
 *   - Determines status based on health with priorities: 'healthy', 'warning', 'error'.
 *   - Uses a Server icon component for representation.
 */
function getSystemHealthMetric(latestMetrics?: LatestMetrics): StatusMetric {
  return {
    label: 'System Health',
    value: latestMetrics?.systemHealth?.status ?? 'unknown',
    status: (() => {
      const healthStatus = latestMetrics?.systemHealth?.status;
      if (healthStatus === 'healthy') return 'healthy';
      if (healthStatus === 'warning') return 'warning';
      return 'error';
    })(),
    icon: <Server className="size-4" />,
  };
}

/**
 * Retrieves the data quality metric from the latest metrics.
 * @example
 * getDataQualityMetric({ dataQuality: { averageScore: 85 } })
 * { label: 'Data Quality', value: 85, unit: '%', trend: 'stable', status: 'healthy', icon: <Database className="size-4" /> }
 * @param {LatestMetrics} [latestMetrics] - The latest metrics containing data quality information.
 * @returns {StatusMetric} An object representing the data quality metric.
 * @description
 *   - Calculates the status based on the average score: 'healthy' for scores >= 80, 'warning' for scores >= 60, and 'error' for lower scores.
 *   - Uses default values (0 for the score) if data quality metrics are not provided.
 */
function getDataQualityMetric(latestMetrics?: LatestMetrics): StatusMetric {
  return {
    label: 'Data Quality',
    value: latestMetrics?.dataQuality?.averageScore ?? 0,
    unit: '%',
    trend: 'stable',
    status: (() => {
      const score = latestMetrics?.dataQuality?.averageScore ?? 0;
      if (score >= 80) return 'healthy';
      if (score >= 60) return 'warning';
      return 'error';
    })(),
    icon: <Database className="size-4" />,
  };
}

/**
* Computes system metrics based on connection status and latest data.
* @example
* useSystemMetrics({
*   isConnected: true,
*   isConnecting: false,
*   connectionError: "Timeout",
*   latestMetrics: { activeJobs: 5, systemHealth: "Good", dataQuality: "High" }
* })
* [StatusMetric, StatusMetric, StatusMetric, StatusMetric]
* @param {Readonly<Object>} args - 
*        An object containing connection status and latest metrics.
* @param {boolean} args.isConnected - Indicates if the system is currently connected.
* @param {boolean} args.isConnecting - Indicates if the system is in the process of connecting.
* @param {string} [args.connectionError] - Describes any connection error if present.
* @param {LatestMetrics} [args.latestMetrics] - Contains the latest metrics data of the system.
* @returns {StatusMetric[]} An array of StatusMetric objects representing various system statuses.
* @description
*   - Combines multiple metrics in one unified representation.
*   - The function is geared towards providing real-time dashboards with actionable insights.
*   - Utilizes helper functions to compute individual metrics like connection status, active jobs, etc.
*   - Intended for use in admin dashboards within a real-time data monitoring context.
*/
export function useSystemMetrics({
  isConnected,
  isConnecting,
  connectionError,
  latestMetrics,
}: Readonly<{
  isConnected: boolean;
  isConnecting: boolean;
  connectionError?: string;
  latestMetrics?: LatestMetrics;
}>): StatusMetric[] {
  return [
    getConnectionStatusMetric(isConnected, isConnecting, connectionError),
    getActiveJobsMetric(latestMetrics),
    getSystemHealthMetric(latestMetrics),
    getDataQualityMetric(latestMetrics),
  ];
}
