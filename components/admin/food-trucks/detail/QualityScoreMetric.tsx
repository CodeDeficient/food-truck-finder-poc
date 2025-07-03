import React from 'react';

interface QualityScoreMetricProps {
  readonly value: React.ReactNode;
  readonly label: string;
  readonly className?: string;
}

export function QualityScoreMetric({
  value,
  label,
  className = 'text-gray-900',
}: QualityScoreMetricProps) {
  return (
    <div className="text-center">
      <div className={`text-lg font-semibold ${className}`}>{value}</div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}
