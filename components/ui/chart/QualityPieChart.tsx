
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

/**
 * Renders a responsive pie chart displaying quality metrics.
 * @example
 * QualityPieChart({ data: sampleData })
 * // renders a pie chart with specified quality data
 * @param {QualityPieChartProps} {data} - The data used to populate the pie chart, consisting of quality metrics.
 * @returns {JSX.Element} A JSX element representing a pie chart.
 * @description
 *   - Utilizes the ResponsiveContainer to ensure the pie chart scales properly.
 *   - The Pie chart uses a static outer radius and custom cell colors.
 *   - The Tooltip displays additional information with a custom content component.
 */
export function QualityPieChart({ data }: QualityPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }: { name?: string; percentage?: string }) =>
            `${name ?? 'Unknown'}: ${percentage ?? '0'}%`
          }
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={QUALITY_COLORS[index]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
