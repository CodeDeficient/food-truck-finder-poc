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

// Page header component
function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Food Truck Management</h1>
      <Button asChild>
        <Link href="/admin/food-trucks/new">
          <PlusCircle className="size-4 mr-2" />
          Add Food Truck
        </Link>
      </Button>
    </div>
  );
}

// Quality score helper functions
function getQualityScoreVariant(score: number) {
  if (score >= 0.8) return 'default';
  if (score >= 0.6) return 'secondary';
  return 'destructive';
}

function getQualityScoreLabel(score: number) {
  if (score >= 0.8) return 'High';
  if (score >= 0.6) return 'Medium';
  return 'Low';
}

// Food truck table row component
function FoodTruckTableRow({ truck }: { readonly truck: FoodTruck }) {
  const qualityScore = truck.data_quality_score ?? 0;

  return (
    <TableRow>
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
          {truck.contact_info?.phone === undefined &&
            truck.contact_info?.email === undefined &&
            truck.contact_info?.website === undefined && (
              <span className="text-muted-foreground">No contact info</span>
            )}
        </div>
      </TableCell>
      <TableCell>{truck.cuisine_type?.join(', ') ?? 'N/A'}</TableCell>
      <TableCell>
        <Badge variant={truck.verification_status === 'verified' ? 'default' : 'outline'}>
          {truck.verification_status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{(qualityScore * 100).toFixed(0)}%</span>
          <Badge variant={getQualityScoreVariant(qualityScore)} className="text-xs">
            {getQualityScoreLabel(qualityScore)}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        {truck.last_scraped_at == undefined
          ? 'N/A'
          : new Date(truck.last_scraped_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" asChild>
          <Link href={`/admin/food-trucks/${truck.id}`}>Edit</Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

// Food trucks table component
function FoodTrucksTable({
  trucks,
  total,
}: {
  readonly trucks: FoodTruck[];
  readonly total: number;
}) {
  return (
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
              <FoodTruckTableRow key={truck.id} truck={truck} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default async function FoodTruckManagementPage() {
  const { trucks, total } = await FoodTruckService.getAllTrucks(100, 0); // Fetch first 100 trucks

  return (
    <div className="flex flex-col gap-4">
      <PageHeader />
      <FoodTrucksTable trucks={trucks} total={total} />
    </div>
  );
}
