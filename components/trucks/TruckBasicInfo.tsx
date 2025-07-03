import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { FoodTruck } from '@/lib/supabase';

interface TruckBasicInfoProps {
  readonly truck: FoodTruck;
}

export function TruckBasicInfo({ truck }: Readonly<TruckBasicInfoProps>) {
  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="dark:text-gray-100">About</CardTitle>
        <CardDescription className="dark:text-gray-400">Food truck information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
          <p className="text-lg font-semibold dark:text-gray-100">{truck.name}</p>
        </div>

        {truck.description != undefined && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Description
            </label>
            <p className="text-gray-900 dark:text-gray-200">{truck.description}</p>
          </div>
        )}

        {truck.cuisine_type && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Cuisine Type
            </label>
            <p className="text-gray-900 dark:text-gray-200">{truck.cuisine_type}</p>
          </div>
        )}

        {truck.price_range && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Price Range
            </label>
            <Badge variant="outline" className="ml-2">
              {truck.price_range}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
