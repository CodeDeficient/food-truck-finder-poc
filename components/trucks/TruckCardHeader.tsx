import React from 'react';
import { CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { FoodTruck } from '@/lib/types/foodTruck';

interface TruckCardHeaderProps {
  readonly truck: FoodTruck;
  readonly isOpen: boolean;
  readonly popularItems: Array<{ name: string; price?: number }>;
  readonly priceRange: string | undefined;
}

export function TruckCardHeader({
  truck,
  isOpen,
  popularItems,
  priceRange
}: TruckCardHeaderProps) {
  return (
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <CardTitle className="text-lg dark:text-gray-100">{truck.name}</CardTitle>
          {(truck.current_location?.address != undefined) && (
            <CardDescription className="flex items-center mt-1 dark:text-gray-400">
              <MapPin className="h-4 w-4 mr-1" />
              {truck.current_location.address}
            </CardDescription>
          )}
        </div>
        <div className="flex flex-col items-end space-y-1">
          <Badge variant={isOpen ? 'default' : 'secondary'}>{isOpen ? 'Open' : 'Closed'}</Badge>
          {/* Show price range fallback if no explicit prices */}
          {popularItems.every((item) => !item.price) && priceRange && (
            <Badge variant="outline" className="mt-1">
              {priceRange}
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
  );
}
