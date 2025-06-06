import React from 'react';
import { FoodTruckService, FoodTruck } from '@/lib/supabase';
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
import { Edit } from 'lucide-react';
import Link from 'next/link';

export default async function DataQualityPage() {
  const { trucks } = await FoodTruckService.getAllTrucks(100, 0); // Fetch first 100 trucks

  // Sort trucks by data quality score (lowest first for review)
  const sortedTrucks = [...trucks].sort(
    (a: FoodTruck, b: FoodTruck) => (a.data_quality_score || 0) - (b.data_quality_score || 0),
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Data Quality Management</h1>

      <Card>
        <CardHeader>
          <CardTitle>Food Truck Data Quality</CardTitle>
          <CardDescription>
            Review and manage the data quality scores for food trucks.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quality Score</TableHead>
                <TableHead>Last Scraped</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTrucks.map((truck: FoodTruck) => (
                <TableRow key={truck.id}>
                  <TableCell className="font-medium">{truck.name}</TableCell>
                  <TableCell>
                    <Badge
                      variant={truck.verification_status === 'verified' ? 'default' : 'outline'}
                    >
                      {truck.verification_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{truck.data_quality_score?.toFixed(1) || 'N/A'}</TableCell>
                  <TableCell>
                    {truck.last_scraped_at
                      ? new Date(truck.last_scraped_at).toLocaleDateString()
                      : 'N/A'}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/food-trucks/${truck.id}?tab=data-quality`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
