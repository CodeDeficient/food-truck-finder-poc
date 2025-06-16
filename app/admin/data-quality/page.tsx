import React from 'react';
import { FoodTruckService, FoodTruck, supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { DataQualityCharts } from '@/components/ui/data-quality-charts';
import { SimpleQualityPanel } from '@/components/ui/simple-quality-panel';
import {
  formatQualityScore,
  categorizeQualityScore,
  getQualityBadgeClasses,
  getQualityScoreAriaLabel,
  type QualityCategory
} from '@/lib/utils/data-quality-formatters';

// Define the data quality stats type based on the database function
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

export default async function DataQualityPage() {
  const { trucks } = await FoodTruckService.getAllTrucks(100, 0); // Fetch first 100 trucks

  // Fetch data quality stats using the Supabase function
  const { data: qualityStatsResult, error: qualityError } = await supabase
    .rpc('get_data_quality_stats')
    .single();

  if (qualityError != undefined) {
    console.error('Error fetching data quality stats:', qualityError);
  }

  const dataQualityStats: DataQualityStats = (qualityStatsResult as DataQualityStats) ?? {
    total_trucks: 0,
    avg_quality_score: 0,
    high_quality_count: 0,
    medium_quality_count: 0,
    low_quality_count: 0,
    verified_count: 0,
    pending_count: 0,
    flagged_count: 0,
  };

  // Sort trucks by data quality score (lowest first for review)
  const sortedTrucks = [...trucks].sort(
    (a: FoodTruck, b: FoodTruck) => (a.data_quality_score ?? 0) - (b.data_quality_score ?? 0),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Data Quality Management</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/data-quality/reports">
              <BarChart3 className="h-4 w-4 mr-2" />
              View Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Data Quality Charts Section */}
      <DataQualityCharts qualityStats={dataQualityStats} />

      {/* Quality Management Panel */}
      <SimpleQualityPanel />

      {/* Food Truck Quality Table */}
      <Card>
        <CardHeader>
          <CardTitle>Food Truck Data Quality Details</CardTitle>
          <CardDescription>
            Review and manage individual food truck data quality scores. Trucks are sorted by quality score (lowest first for priority review).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Verification Status</TableHead>
                <TableHead>Quality Score</TableHead>
                <TableHead>Quality Category</TableHead>
                <TableHead>Last Scraped</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrucks.map((truck: FoodTruck) => {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                const qualityCategory: QualityCategory = categorizeQualityScore(truck.data_quality_score);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                const badgeClasses: string = getQualityBadgeClasses(truck.data_quality_score);
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
                const ariaLabel: string = getQualityScoreAriaLabel(truck.data_quality_score);

                return (
                  <TableRow key={truck.id}>
                    <TableCell className="font-medium">{truck.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={truck.verification_status === 'verified' ? 'default' : 'outline'}
                      >
                        {truck.verification_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span aria-label={ariaLabel}>
                        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-call */}
                        {formatQualityScore(truck.data_quality_score)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={badgeClasses}>
                        {/* eslint-disable-next-line @typescript-eslint/no-unsafe-member-access */}
                        {qualityCategory.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {(truck.last_scraped_at === undefined)
                        ? 'N/A'
                        : new Date(truck.last_scraped_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/food-trucks/${truck.id}?tab=data-quality`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit {truck.name}</span>
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
