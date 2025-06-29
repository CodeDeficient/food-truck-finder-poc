'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// SOTA color scheme for data quality categories
const QUALITY_COLORS = [
  '#22c55e',    // Green for high quality (≥80%)
  '#f59e0b',  // Amber for medium quality (60-79%)
  '#ef4444',     // Red for low quality (<60%)
] as const;

interface DataQualityStats {
  total_trucks: number;
  avg_quality_score: number;
  high_quality_count: number;
  medium_quality_count: number;
  low_quality_count: number;
  verified_count: number;
  pending_count: number;
  flagged_count: number;
}

interface DataQualityChartsProps {
  readonly qualityStats: DataQualityStats;
}

// Custom tooltip for better accessibility and UX
interface TooltipProps {
  readonly active?: boolean;
  readonly payload?: Array<{
    value: number;
    payload: {
      percentage?: string;
    };
  }>;
  readonly label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active === true && payload != undefined && payload.length > 0) {
    return (
      <div
        className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg"
        role="status"
        aria-live="assertive"
      >
        <p className="font-medium">{`${label ?? 'Unknown'}: ${payload[0].value}`}</p>
        <p className="text-sm text-gray-600">
          {payload[0].payload.percentage != undefined && payload[0].payload.percentage !== '' && `${payload[0].payload.percentage}% of total`}
        </p>
      </div>
    );
  }
};

// Quality Distribution Pie Chart Component
const QualityDistributionChart: React.FC<{ qualityStats: DataQualityStats }> = ({ qualityStats }) => {
  const data = [
    {
      name: 'High Quality',
      value: qualityStats.high_quality_count,
      percentage: ((qualityStats.high_quality_count / qualityStats.total_trucks) * 100).toFixed(1),
    },
    {
      name: 'Medium Quality',
      value: qualityStats.medium_quality_count,
      percentage: ((qualityStats.medium_quality_count / qualityStats.total_trucks) * 100).toFixed(1),
    },
    {
      name: 'Low Quality',
      value: qualityStats.low_quality_count,
      percentage: ((qualityStats.low_quality_count / qualityStats.total_trucks) * 100).toFixed(1),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Distribution</CardTitle>
        <CardDescription>
          Breakdown of food trucks by data quality categories
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({
                name,
                percentage
              }: {
                name?: string;
                percentage?: string;
              }) => `${name ?? 'Unknown'}: ${percentage ?? '0'}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={Object.values(QUALITY_COLORS)[index]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Verification Status Bar Chart Component
const VerificationStatusChart: React.FC<{ qualityStats: DataQualityStats }> = ({ qualityStats }) => {
  const data = [
    {
      name: 'Verified',
      count: qualityStats.verified_count,
      percentage: ((qualityStats.verified_count / qualityStats.total_trucks) * 100).toFixed(1),
    },
    {
      name: 'Pending',
      count: qualityStats.pending_count,
      percentage: ((qualityStats.pending_count / qualityStats.total_trucks) * 100).toFixed(1),
    },
    {
      name: 'Flagged',
      count: qualityStats.flagged_count,
      percentage: ((qualityStats.flagged_count / qualityStats.total_trucks) * 100).toFixed(1),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Status</CardTitle>
        <CardDescription>
          Current verification status of all food trucks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Helper function to get score color
const getScoreColor = (score: number): string => {
  if (score >= 0.8) return 'text-green-600';
  if (score >= 0.6) return 'text-yellow-600';
  return 'text-red-600';
};

// Helper function to get quality threshold label
const getQualityThreshold = (score: number): string => {
  if (score >= 0.8) return 'High';
  if (score >= 0.6) return 'Medium';
  return 'Low';
};

// Quality Score Overview Component
const QualityScoreOverview: React.FC<{ qualityStats: DataQualityStats }> = ({ qualityStats }) => {
  const averageScore = (qualityStats.avg_quality_score * 100).toFixed(1);
  const scoreColor = getScoreColor(qualityStats.avg_quality_score);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Overall Quality Score</CardTitle>
        <CardDescription>
          Average data quality score across all food trucks
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-center">
        <div className="text-center">
          <div className={`text-6xl font-bold ${scoreColor}`}>
            {averageScore}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Based on {qualityStats.total_trucks} food trucks
          </p>
          <div className="mt-4 text-sm">
            <div className="flex justify-between items-center">
              <span>Quality Threshold:</span>
              <span className="font-medium">
                {getQualityThreshold(qualityStats.avg_quality_score)}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Main Data Quality Charts Component
export const DataQualityCharts: React.FC<DataQualityChartsProps> = ({ qualityStats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <QualityScoreOverview qualityStats={qualityStats} />
      <QualityDistributionChart qualityStats={qualityStats} />
      <VerificationStatusChart qualityStats={qualityStats} />
    </div>
  );
};

export default DataQualityCharts;
