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
} from '@/components/ui/Table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default async function FoodTruckManagementPage() {
  const { trucks, total } = await FoodTruckService.getAllTrucks(100, 0); // Fetch first 100 trucks

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Food Truck Management</h1>
        <Button asChild>
          <Link href="/admin/food-trucks/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Food Truck
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Food Trucks</CardTitle>
          <CardDescription>
            Manage your food trucks and their details. ({total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cuisine</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Quality Score</TableHead>
                <TableHead>Last Scraped</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trucks.map((truck: FoodTruck) => (
                <TableRow key={truck.id}>
                  <TableCell className="font-medium">{truck.name}</TableCell>
                  <TableCell>{truck.cuisine_type?.join(', ') || 'N/A'}</TableCell>
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
                      <Link href={`/admin/food-trucks/${truck.id}`}>Edit</Link>
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
