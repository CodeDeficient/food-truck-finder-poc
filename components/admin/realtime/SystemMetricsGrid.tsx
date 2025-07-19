'use client';


import type { StatusMetric } from './useSystemMetrics'; // Import StatusMetric type
import { getStatusColor, getStatusIcon, getTrendIcon } from './StatusHelpers'; // Import helper functions

type Status = 'healthy' | 'warning' | 'error' | 'unknown';

interface SystemMetricsGridProps {
  readonly metrics: StatusMetric[];
}

interface SystemMetricsGridProps {
  readonly metrics: StatusMetric[];
}

/**
* Displays a grid of system metrics using provided data.
* @example
* SystemMetricsGrid({ metrics: sampleMetricsArray })
* <div className="grid">...</div>
* @param {SystemMetricsGridProps} {metrics} - An array of metric objects to be displayed in the grid.
* @returns {JSX.Element} A JSX element representing a styled grid displaying system metrics.
* @description
*   - Each metric is rendered with icons representing its status and trend.
*   - Metrics are styled based on their status, indicating their current state.
*   - Responsive grid layout adapts based on screen size.
*/
export function SystemMetricsGrid({ metrics }: SystemMetricsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className={`p-3 rounded-lg border ${getStatusColor(metric.status as Status)}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {metric.icon}
              <span className="text-sm font-medium">{metric.label}</span>
            </div>
            {getStatusIcon(metric.status as Status)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">
              {metric.value}
              {metric.unit}
            </span>
            {getTrendIcon(metric.trend)}
          </div>
        </div>
      ))}
    </div>
  );
}
