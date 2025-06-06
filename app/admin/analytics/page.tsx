import React from 'react';
import { APIUsageService } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table';
import { BarChart3 } from 'lucide-react';

export default async function AnalyticsPage() {
  const usageStats = await APIUsageService.getAllUsageStats();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Analytics & Reporting</h1>

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

      <Card>
        <CardHeader>
          <CardTitle>Food Truck Data Trends</CardTitle>
          <CardDescription>
            Visualize trends in new food truck additions, menu changes, and event activity.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-48 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mr-2" />
            Coming Soon: Advanced Charts & Visualizations
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
