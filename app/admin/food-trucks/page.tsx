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
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function FoodTruckManagementPage() {
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
                <TableHead>Contact</TableHead>
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
                  <TableCell>
                    <div className="space-y-1">
                      {truck.contact_info?.phone !== undefined && (
                        <div className="text-sm">📞 {truck.contact_info.phone}</div>
                      )}
                      {truck.contact_info?.email !== undefined && (
                        <div className="text-sm">✉️ {truck.contact_info.email}</div>
                      )}
                      {truck.contact_info?.website !== undefined && (
                        <div className="text-sm">🌐 {truck.contact_info.website}</div>
                      )}
                      {(truck.contact_info?.phone === undefined) && (truck.contact_info?.email === undefined) && (truck.contact_info?.website === undefined) && (
                        <span className="text-muted-foreground">No contact info</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{truck.cuisine_type?.join(', ') ?? 'N/A'}</TableCell>
                  <TableCell>
                    <Badge
                      variant={truck.verification_status === 'verified' ? 'default' : 'outline'}
                    >
                      {truck.verification_status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      // @ts-expect-error TS(2532): Object is possibly 'undefined'.
                      <span>{(truck.data_quality_score * 100).toFixed(0)}%</span>
                      <Badge
                        variant={
                          // @ts-expect-error TS(2532): Object is possibly 'undefined'.
                          truck.data_quality_score >= 0.8 ? 'default' :
                          // @ts-expect-error TS(2532): Object is possibly 'undefined'.
                          truck.data_quality_score >= 0.6 ? 'secondary' : 'destructive'
                        }
                        className="text-xs"
                      >
                        {(truck.data_quality_score ?? 0) >= 0.8 ? 'High' :
                         (truck.data_quality_score ?? 0) >= 0.6 ? 'Medium' : 'Low'}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {(truck.last_scraped_at === undefined)
                      ? 'N/A'
                      : new Date(truck.last_scraped_at).toLocaleDateString()}
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
