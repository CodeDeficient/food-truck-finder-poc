import React from 'react';
import { Clock } from 'lucide-react';

interface OperatingHoursSectionProps {
  todayHours: { open: string; close: string; closed: boolean } | undefined;
  formatHours: (hours: { open: string; close: string; closed: boolean }) => string;
}

export function OperatingHoursSection({ todayHours, formatHours }: OperatingHoursSectionProps) {
  if (!todayHours) return null;

  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Today's Hours</h4>
      <div className="flex items-center gap-2">
        <Clock className="h-3 w-3 text-gray-500" />
        <span className="text-sm dark:text-gray-300">
          {formatHours(todayHours)}
        </span>
      </div>
    </div>
  );
}
