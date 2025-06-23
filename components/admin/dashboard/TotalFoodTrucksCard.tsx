import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';

interface TotalFoodTrucksCardProps {
  readonly totalFoodTrucks: number;
  readonly pendingVerifications: number;
}

export function TotalFoodTrucksCard({ totalFoodTrucks, pendingVerifications }: Readonly<TotalFoodTrucksCardProps>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Food Trucks</CardTitle>
        <Truck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalFoodTrucks}</div>
        <p className="text-xs text-muted-foreground">
          {pendingVerifications} pending verification
        </p>
      </CardContent>
    </Card>
  );
}
