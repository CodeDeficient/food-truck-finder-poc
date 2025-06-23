import React from 'react';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { TruckCard } from '@/components/TruckCard';
import { FoodTruck } from '@/lib/types/foodTruck';

interface TruckListSectionProps {
  readonly filteredTrucks: FoodTruck[];
  readonly selectedTruckId: string | undefined;
  readonly setSelectedTruckId: (id: string | undefined) => void;
  readonly isOpen: (truck: FoodTruck) => boolean;
  readonly userLocation: { lat: number; lng: number } | undefined;
  readonly formatPrice: (price: number) => string;
}

export function TruckListSection({
  filteredTrucks,
  selectedTruckId,
  setSelectedTruckId,
  isOpen,
  userLocation,
  formatPrice,
}: TruckListSectionProps) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <h3 className="text-lg font-semibold dark:text-gray-100">
        Nearby Trucks ({filteredTrucks.length})
      </h3>
      <Accordion
        type="single"
        collapsible
        className="w-full"
        value={selectedTruckId ?? undefined}
        onValueChange={(value) => setSelectedTruckId(value === "" ? undefined : value)}
      >
        {filteredTrucks.map((truck) => (
          <AccordionItem value={truck.id} key={truck.id}>
            <AccordionTrigger className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md">
              <div className="flex-1 text-left">
                <h4 className="font-medium dark:text-gray-100">{truck.name}</h4>
                {truck.current_location?.address && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                    {truck.current_location.address}
                  </p>
                )}
              </div>
              <Badge variant={isOpen(truck) ? 'default' : 'secondary'}>
                {isOpen(truck) ? 'Open' : 'Closed'}
              </Badge>
            </AccordionTrigger>
            <AccordionContent>
              <TruckCard
                truck={truck}
                isOpen={isOpen(truck)}
                onSelectTruck={() => setSelectedTruckId(truck.id)}
                userLocation={userLocation}
                formatPrice={formatPrice}
                hideHeader={true}
              />
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
