import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import type { FoodTruck } from '@/lib/supabase';

interface TruckLocationInfoProps {
  truck: FoodTruck;
}

export function TruckLocationInfo({ truck }: TruckLocationInfoProps) {
  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <MapPin className="h-5 w-5" />
          Location
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Current location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {truck.current_location?.address == undefined ? (
          <p className="text-gray-400 text-sm">No address available</p>
        ) : (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
            <p className="text-gray-900 dark:text-gray-200">{truck.current_location.address}</p>
          </div>
        )}

        {truck.current_location?.lat != undefined && truck.current_location?.lng != undefined && (
          <div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Coordinates</label>
            <p className="text-gray-900 dark:text-gray-200 text-sm">
              {truck.current_location.lat.toFixed(6)}, {truck.current_location.lng.toFixed(6)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
