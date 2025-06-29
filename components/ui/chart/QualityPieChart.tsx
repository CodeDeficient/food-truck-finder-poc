import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { QUALITY_COLORS } from '../dataQualityCharts';
import { CustomTooltip } from '../dataQualityCharts';

interface QualityPieChartProps {
  readonly data: {
    name: string;
    value: number;
    percentage: string;
  }[];
}

export function QualityPieChart({ data }: QualityPieChartProps) {
  return (
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
              fill={(QUALITY_COLORS as string[])[index]} 
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
