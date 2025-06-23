import React from 'react';
import { FoodTruck } from '@/lib/types/foodTruck';
import { TruckAccordionContent } from './TruckAccordionContent';
import { TruckListHeader } from './TruckListHeader'; // Import the new component

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
      <TruckListHeader truckCount={filteredTrucks.length} />
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
