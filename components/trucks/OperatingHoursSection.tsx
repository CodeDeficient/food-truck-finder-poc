import React from 'react';
import { Clock } from 'lucide-react';
import { DailyOperatingHours } from '@/lib/types'; // Import DailyOperatingHours

interface OperatingHoursSectionProps {
  readonly todayHours: DailyOperatingHours | undefined; // Update type
  readonly formatHours: (hours: DailyOperatingHours) => string; // Update type
}

/**
 * Renders today's operating hours section.
 * @example
 * OperatingHoursSection({ todayHours: { closed: false, open: '09:00', close: '17:00' }, formatHours: (hours) => `${hours.open} - ${hours.close}` })
 * // Returns a JSX element with formatted operating hours or 'Closed'.
 * @param {Readonly<OperatingHoursSectionProps>} {todayHours, formatHours} - The properties for today's operating hours and the function to format them.
 * @returns {JSX.Element | undefined} A JSX element displaying today's hours, or nothing if hours are undefined.
 * @description
 *   - The component displays 'Closed' if todayHours indicates closure.
 *   - Utilizes a Clock icon for a visual representation of hours.
 *   - Ensures dark mode compatibility through styling classes.
 */
export function OperatingHoursSection({
  todayHours,
  formatHours,
}: Readonly<OperatingHoursSectionProps>) {
  if (todayHours === undefined) return; // Return null if no hours

  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Today's Hours</h4>
      <div className="flex items-center gap-2">
        <Clock className="size-3 text-gray-500" />
        <span className="text-sm dark:text-gray-300">
          {todayHours.closed ? 'Closed' : formatHours(todayHours)}
        </span>
      </div>
    </div>
  );
}
