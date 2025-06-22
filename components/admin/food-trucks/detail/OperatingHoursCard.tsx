import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

import { type FoodTruck, type OperatingHours } from '@/lib/supabase';

interface OperatingHoursCardProps {
  truck: FoodTruck;
}

export function OperatingHoursCard({ truck }: OperatingHoursCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Operating Hours
        </CardTitle>
        <CardDescription>Daily operating schedule</CardDescription>
      </CardHeader>
      <CardContent>
        {(truck.operating_hours !== undefined) && Object.keys(truck.operating_hours).length > 0 ? (
          <div className="space-y-2">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => {
              const dayData = truck.operating_hours?.[day as keyof OperatingHours];
              const dayName = day.charAt(0).toUpperCase() + day.slice(1);

              return (
                <div key={day} className="flex justify-between items-center py-1">
                  <span className="font-medium text-gray-700">{dayName}</span>
                  {(() => {
                    if (dayData?.closed === true) {
                      return <span className="text-red-600 text-sm">Closed</span>;
                    }
                    if (dayData?.open && dayData?.close) {
                      return (
                        <span className="text-gray-900 text-sm">
                          {dayData.open} - {dayData.close}
                        </span>
                      );
                    }
                    return <span className="text-gray-400 text-sm">Not specified</span>;
                  })()}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No operating hours available</p>
        )}
      </CardContent>
    </Card>
  );
}
