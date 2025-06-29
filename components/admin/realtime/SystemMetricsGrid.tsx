'use client';

import React from 'react';
import { StatusMetric } from './useSystemMetrics'; // Import StatusMetric type
import { getStatusColor, getStatusIcon, getTrendIcon } from './StatusHelpers'; // Import helper functions

type Status = 'healthy' | 'warning' | 'error' | 'unknown';
type Trend = 'up' | 'down' | 'stable' | undefined;

interface SystemMetricsGridProps {
  readonly metrics: StatusMetric[];
}

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
              {metric.value}{metric.unit}
            </span>
            {getTrendIcon(metric.trend as Trend)}
          </div>
        </div>
      ))}
    </div>
  );
}
