
import { APIUsageService } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart3 } from 'lucide-react';

// API Usage Statistics Table Component
/**
 * Renders a table displaying API usage statistics.
 * @example
 * APIUsageTable({usageStats: [{id: '1', service_name: 'ServiceA', usage_date: '2023-01-01', requests_count: 100, tokens_used: 50}]})
 * // Renders a card with a table showing service name, usage date, request count, and tokens used.
 * @param {Object} {usageStats} - An object containing usage statistics.
 * @param {Array} usageStats - Array of usage statistic objects.
 * @param {string} usageStats[].id - Unique identifier for the statistic entry.
 * @param {string} usageStats[].service_name - Name of the service.
 * @param {string} usageStats[].usage_date - Date of the usage in ISO format.
 * @param {number} usageStats[].requests_count - Number of requests made.
 * @param {number} usageStats[].tokens_used - Number of tokens used.
 * @returns {JSX.Element} A React component rendering API usage statistics in a table format.
 * @description
 *   - Transforms each usage date into a locale-specific date string.
 *   - Iterates through `usageStats` to populate table rows.
 */
function APIUsageTable({
  usageStats,
}: {
  readonly usageStats: Array<{
    readonly id: string;
    readonly service_name: string;
    readonly usage_date: string;
    readonly requests_count: number;
    readonly tokens_used: number;
  }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Usage Statistics</CardTitle>
        <CardDescription>
          Monitor API requests and token usage for various services.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Usage Date</TableHead>
              <TableHead>Requests Count</TableHead>
              <TableHead>Tokens Used</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {usageStats.map((stat) => (
              <TableRow key={stat.id}>
                <TableCell className="font-medium">{stat.service_name}</TableCell>
                <TableCell>{new Date(stat.usage_date).toLocaleDateString()}</TableCell>
                <TableCell>{stat.requests_count}</TableCell>
                <TableCell>{stat.tokens_used}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Data Trends Placeholder Component
/**
 * Renders a placeholder component to represent food truck data trends.
 * @example
 * DataTrendsPlaceholder()
 * <Card> ... </Card>
 * @returns {JSX.Element} A JSX element containing placeholder content for future data trend visualizations.
 * @description
 *   - Utilizes the Card component to encapsulate the placeholder content.
 *   - Displays a header specifying the focus on food truck data trends.
 *   - Includes a notification for upcoming advanced charts and visualizations.
 */
function DataTrendsPlaceholder() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Food Truck Data Trends</CardTitle>
        <CardDescription>
          Visualize trends in new food truck additions, menu changes, and event activity.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          <BarChart3 className="size-12 mr-2" />
          Coming Soon: Advanced Charts & Visualizations
        </div>
      </CardContent>
    </Card>
  );
}

export default async function AnalyticsPage() {
  const usageStats = await APIUsageService.getAllUsageStats();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Analytics & Reporting</h1>
      <APIUsageTable usageStats={usageStats} />
      <DataTrendsPlaceholder />
    </div>
  );
}
