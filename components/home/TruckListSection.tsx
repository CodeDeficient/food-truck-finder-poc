import React from 'react';
import { FoodTruck } from '@/lib/types/foodTruck';
import { TruckAccordionContent } from './TruckAccordionContent';

interface TruckListSectionProps {
  readonly filteredTrucks: FoodTruck[];
  readonly selectedTruckId: string | undefined;
  readonly setSelectedTruckId: (id: string | undefined) => void;
  readonly isOpen: (truck: FoodTruck) => boolean;
  readonly userLocation: { lat: number; lng: number } | undefined;
}

export function TruckListSection({
  filteredTrucks,
  selectedTruckId,
  setSelectedTruckId,
  isOpen,
  userLocation,
}: Readonly<TruckListSectionProps>) {
  return (
    <div className="lg:col-span-1 space-y-4">
      <h3 className="text-lg font-semibold dark:text-gray-100">
        Nearby Trucks ({filteredTrucks.length})
      </h3>
      <TruckAccordionContent
        filteredTrucks={filteredTrucks}
        selectedTruckId={selectedTruckId}
        setSelectedTruckId={setSelectedTruckId}
        isOpen={isOpen}
        userLocation={userLocation}
      />
    </div>
  );
}
