import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
/**
 * Displays detailed information about the current location of a truck.
 * @example
 * LocationInfoCard({ truck: sampleTruck })
 * <Card>...</Card>
 * @param {LocationInfoCardProps} {truck} - Object containing truck location details.
 * @returns {JSX.Element} A Card element containing location details.
 * @description
 *   - Shows address, coordinates, and last updated timestamp if available.
 *   - Handles missing or undefined data by rendering alternative text.
 *   - Utilizes semantic HTML elements for accessibility and clarity.
 */
export function LocationInfoCard({ truck }) {
    var _a, _b, _c, _d;
    return (<Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5"/>
          Location Information
        </CardTitle>
        <CardDescription>Current location and address details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {((_a = truck.current_location) === null || _a === void 0 ? void 0 : _a.address) === undefined ? (<p className="text-gray-400 text-sm">No address available</p>) : (<div>
            <label className="text-sm font-medium text-gray-500">Address</label>
            <p className="text-gray-900">{truck.current_location.address}</p>
          </div>)}

        {((_b = truck.current_location) === null || _b === void 0 ? void 0 : _b.lat) !== undefined && ((_c = truck.current_location) === null || _c === void 0 ? void 0 : _c.lng) !== undefined && (<div>
            <label className="text-sm font-medium text-gray-500">Coordinates</label>
            <p className="text-gray-900 font-mono text-sm">
              {truck.current_location.lat.toFixed(6)}, {truck.current_location.lng.toFixed(6)}
            </p>
          </div>)}

        {((_d = truck.current_location) === null || _d === void 0 ? void 0 : _d.timestamp) != undefined && (<div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="text-gray-900">
              {new Date(truck.current_location.timestamp).toLocaleString()}
            </p>
          </div>)}
      </CardContent>
    </Card>);
}
