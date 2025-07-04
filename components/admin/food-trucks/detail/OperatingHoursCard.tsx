import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';

import { type FoodTruck, type OperatingHours } from '@/lib/supabase';

interface OperatingHoursCardProps {
  readonly truck: FoodTruck;
}

/**
 * Renders a card showing the operating hours of a truck.
 * @example
 * OperatingHoursCard({ truck: { operating_hours: { monday: { open: '09:00', close: '17:00' } } } })
 * // Returns a card element indicating "Operating Hours" with specific hours or "Closed"/"Not specified" for each day.
 * @param {Object} truck - An object representing the food truck, which includes an `operating_hours` property.
 * @returns {JSX.Element} A React component that displays a card with the truck's operating hours information.
 * @description
 *   - Displays "Closed" if a specific day is marked as closed.
 *   - Shows "Not specified" when the operating hours for a day are not provided.
 *   - Utilizes the `Clock` component for visual indication of operating hours.
 */
export function OperatingHoursCard({ truck }: Readonly<OperatingHoursCardProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="size-5" />
          Operating Hours
        </CardTitle>
        <CardDescription>Daily operating schedule</CardDescription>
      </CardHeader>
      <CardContent>
        {truck.operating_hours != undefined && Object.keys(truck.operating_hours).length > 0 ? (
          <div className="space-y-2">
            {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(
              (day) => {
                const dayData = truck.operating_hours?.[day as keyof OperatingHours];
                const dayName = day.charAt(0).toUpperCase() + day.slice(1);

                return (
                  <div key={day} className="flex justify-between items-center py-1">
                    <span className="font-medium text-gray-700">{dayName}</span>
                    {(() => {
                      if (dayData?.closed === true) {
                        return <span className="text-red-600 text-sm">Closed</span>;
                      }
                      if (
                        dayData?.open != undefined &&
                        dayData.open !== '' &&
                        dayData?.close != undefined &&
                        dayData.close !== ''
                      ) {
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
              },
            )}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No operating hours available</p>
        )}
      </CardContent>
    </Card>
  );
}
