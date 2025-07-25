import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
/**
 * Displays the schedule for a specific day.
 * @example
 * DaySchedule({ day: 'monday', dayData: { open: '8:00 AM', close: '5:00 PM', closed: false } })
 * <div>...</div>
 * @param {Object} props - The properties for the schedule component.
 * @param {string} props.day - The name of the day (e.g., 'monday').
 * @param {DayData} [props.dayData] - Optional data object containing the opening and closing hours and a closed status.
 * @returns {JSX.Element} A React component representing the schedule for the given day.
 * @description
 *   - Capitalizes the first letter of the provided day's name.
 *   - Displays 'Closed' if dayData.closed is true, otherwise displays opening and closing times.
 *   - 'N/A' is shown if opening or closing time is not defined.
 */
function DaySchedule({ day, dayData }) {
    var _a, _b;
    const dayName = day.charAt(0).toUpperCase() + day.slice(1);
    return (<div className="flex justify-between items-center">
      <span className="text-sm font-medium dark:text-gray-200">{dayName}</span>
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {(dayData === null || dayData === void 0 ? void 0 : dayData.closed) === true
            ? 'Closed'
            : `${(_a = dayData === null || dayData === void 0 ? void 0 : dayData.open) !== null && _a !== void 0 ? _a : 'N/A'} - ${(_b = dayData === null || dayData === void 0 ? void 0 : dayData.close) !== null && _b !== void 0 ? _b : 'N/A'}`}
      </span>
    </div>);
}
/**
 * Renders a truck's operating hours in a card format.
 * @example
 * TruckOperatingHours({ truck: { operating_hours: { monday: { open: "9:00 AM", close: "5:00 PM" } } } })
 * <Card>...</Card>
 * @param {TruckOperatingHoursProps} {truck} - Object containing truck details including operating hours.
 * @returns {JSX.Element} A JSX element representing truck operating hours card.
 * @description
 *   - Utilizes a Card component for displaying the information visually.
 *   - Iterates through the days of the week to display operating hours for each day.
 *   - Displays a message when operating hours are not available.
 */
export function TruckOperatingHours({ truck }) {
    const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const hasOperatingHours = truck.operating_hours != undefined && Object.keys(truck.operating_hours).length > 0;
    return (<Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Clock className="size-5"/>
          Operating Hours
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Daily schedule</CardDescription>
      </CardHeader>
      <CardContent>
        {hasOperatingHours ? (<div className="space-y-2">
            {daysOfWeek.map((day) => {
                var _a;
                const dayData = (_a = truck.operating_hours) === null || _a === void 0 ? void 0 : _a[day];
                return <DaySchedule key={day} day={day} dayData={dayData}/>;
            })}
          </div>) : (<p className="text-gray-400 text-sm">Operating hours not available</p>)}
      </CardContent>
    </Card>);
}
