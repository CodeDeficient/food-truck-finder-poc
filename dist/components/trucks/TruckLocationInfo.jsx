import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
/**
 * Displays information about a truck's current location.
 * @example
 * TruckLocationInfo({ truck: sample_truck })
 * <Card>...</Card>
 * @param {TruckLocationInfoProps} {truck} - Object containing truck data with location details.
 * @returns {JSX.Element} A card displaying the truck's current location and coordinates.
 * @description
 *   - Uses Tailwind CSS classes for styling and responsiveness.
 *   - Displays a message when the truck's address is unavailable.
 *   - Renders latitude and longitude with precision up to six decimal places.
 *   - Adapts text and background colors based on dark mode settings.
 */
export function TruckLocationInfo({ truck }) {
    var _a, _b, _c;
    return (<Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <MapPin className="size-5"/>
          Location
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Current location</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {((_a = truck.current_location) === null || _a === void 0 ? void 0 : _a.address) == undefined ? (<p className="text-gray-400 text-sm">No address available</p>) : (<div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Address</label>
            <p className="text-gray-900 dark:text-gray-200">{truck.current_location.address}</p>
          </div>)}

        {((_b = truck.current_location) === null || _b === void 0 ? void 0 : _b.lat) != undefined && ((_c = truck.current_location) === null || _c === void 0 ? void 0 : _c.lng) != undefined && (<div>
            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Coordinates
            </label>
            <p className="text-gray-900 dark:text-gray-200 text-sm">
              {truck.current_location.lat.toFixed(6)}, {truck.current_location.lng.toFixed(6)}
            </p>
          </div>)}
      </CardContent>
    </Card>);
}
