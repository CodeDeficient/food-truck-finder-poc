import React from 'react';
import { Clock } from 'lucide-react';
import { DailyOperatingHours } from '@/lib/types'; // Import DailyOperatingHours

interface OperatingHoursSectionProps {
  readonly todayHours: DailyOperatingHours | undefined; // Update type
  readonly formatHours: (hours: DailyOperatingHours) => string; // Update type
}

export function OperatingHoursSection({ todayHours, formatHours }: Readonly<OperatingHoursSectionProps>) {
  if (todayHours === undefined) return; // Return null if no hours

  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Today's Hours</h4>
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-gray-500" />
        <span className="text-sm dark:text-gray-300">
          {todayHours.closed ? 'Closed' : formatHours(todayHours)}
        </span>
      </div>
    </div>
  );
}
