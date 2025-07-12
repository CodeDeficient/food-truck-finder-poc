
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { FoodTruck } from '@/lib/types';

interface TruckCardHeaderProps {
  readonly truck: FoodTruck;
  readonly isOpen: boolean;
  readonly popularItems: Array<{ name: string; price: number | string | undefined }>;
  readonly priceRange: string | undefined;
}

/**
 * Renders a header component for a truck card, displaying truck details and status.
 * @example
 * TruckCardHeader({
 *   truck: { name: 'Food Truck', current_location: { address: '123 Street' } },
 *   isOpen: true,
 *   popularItems: [{ name: 'Burger', price: undefined }],
 *   priceRange: '$$'
 * })
 * <CardHeader>...</CardHeader>
 * @param {Object} truck - Object containing information about the truck, including name and current location.
 * @param {boolean} isOpen - Indicates whether the truck is currently open or closed.
 * @param {Array} popularItems - Array containing popular items offered by the truck, typically objects with a name and optional price.
 * @param {string} priceRange - String indicating the general price range of items if explicit prices are unavailable.
 * @returns {JSX.Element} JSX representation of the card header for a truck.
 * @description
 *   - Displays the truck's name and current address if available.
 *   - Shows the open/closed status with a badge, changing appearance according to the status.
 *   - Fallback badge displaying price range shows only if no prices are available for popular items.
 */
export function TruckCardHeader({ truck, isOpen, popularItems, priceRange }: TruckCardHeaderProps) {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <CardTitle className="text-lg dark:text-gray-100">{truck.name}</CardTitle>
          {truck.current_location?.address != undefined && (
            <CardDescription className="flex items-center mt-1 dark:text-gray-400">
              <MapPin className="size-4 mr-1" />
              {truck.current_location.address}
            </CardDescription>
          )}
        </div>
        <div className="flex flex-col items-end space-y-1">
          <Badge variant={isOpen ? 'default' : 'secondary'}>{isOpen ? 'Open' : 'Closed'}</Badge>
          {/* Show price range fallback if no explicit prices */}
          {popularItems.every((item) => item.price === undefined) &&
            priceRange !== undefined &&
            priceRange !== '' && (
              <Badge variant="outline" className="mt-1">
                {priceRange}
              </Badge>
            )}
        </div>
      </div>
    </CardHeader>
  );
}
