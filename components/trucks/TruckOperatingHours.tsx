import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import type { FoodTruck } from '@/lib/supabase';

interface TruckOperatingHoursProps {
  truck: FoodTruck;
}

interface DayData {
  closed?: boolean;
  open?: string;
  close?: string;
}

function DaySchedule({ day, dayData }: { day: string; dayData?: DayData }) {
  const dayName = day.charAt(0).toUpperCase() + day.slice(1);
  
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm font-medium dark:text-gray-200">{dayName}</span>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {dayData?.closed === true ? 'Closed' : `${dayData?.open ?? 'N/A'} - ${dayData?.close ?? 'N/A'}`}
      </span>
    </div>
  );
}

export function TruckOperatingHours({ truck }: TruckOperatingHoursProps) {
  const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const hasOperatingHours = truck.operating_hours && Object.keys(truck.operating_hours).length > 0;

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Clock className="h-5 w-5" />
          Operating Hours
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Daily schedule</CardDescription>
      </CardHeader>
      <CardContent>
        {hasOperatingHours ? (
          <div className="space-y-2">
            {daysOfWeek.map((day) => {
              const dayData = truck.operating_hours?.[day as keyof typeof truck.operating_hours] as DayData | undefined;
              return (
                <DaySchedule key={day} day={day} dayData={dayData} />
              );
            })}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Operating hours not available</p>
        )}
      </CardContent>
    </Card>
  );
}
