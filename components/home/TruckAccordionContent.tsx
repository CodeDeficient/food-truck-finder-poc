import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { FoodTruck } from '@/lib/types/foodTruck';
import { TruckAccordionItem } from '@/components/trucks/TruckAccordionItem';

interface TruckAccordionContentProps {
  readonly filteredTrucks: FoodTruck[];
  readonly selectedTruckId: string | undefined;
  readonly setSelectedTruckId: (id: string | undefined) => void;
  readonly isOpen: (truck: FoodTruck) => boolean;
  readonly userLocation: { lat: number; lng: number } | undefined;
}

export function TruckAccordionContent({
  filteredTrucks,
  selectedTruckId,
  setSelectedTruckId,
  isOpen,
  userLocation,
}: Readonly<TruckAccordionContentProps>) {
  return (
    <Accordion
      type="single"
      collapsible
      className="w-full"
      value={selectedTruckId ?? undefined}
      onValueChange={(value) => setSelectedTruckId(value === "" ? undefined : value)}
    >
      {filteredTrucks.map((truck) => (
        <TruckAccordionItem
          key={truck.id}
          truck={truck}
          selectedTruckId={selectedTruckId}
          setSelectedTruckId={setSelectedTruckId}
          isOpen={isOpen}
          userLocation={userLocation}
        />
      ))}
    </Accordion>
  );
}
