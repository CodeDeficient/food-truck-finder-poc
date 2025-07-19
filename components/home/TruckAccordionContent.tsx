'use client';

import React from 'react';
import { Accordion } from '@/components/ui/accordion';
import { TruckAccordionItem } from '@/components/trucks/TruckAccordionItem';
import type { FoodTruck } from '@/lib/types';

interface TruckAccordionContentProps {
  filteredTrucks: FoodTruck[];
  selectedTruckId: string | undefined;
  setSelectedTruckId: (id: string | undefined) => void;
  isOpen: (truck: FoodTruck) => boolean;
  userLocation: { lat: number; lng: number } | undefined;
}

export const TruckAccordionContent: React.FC<TruckAccordionContentProps> = ({
  filteredTrucks,
  selectedTruckId,
  setSelectedTruckId,
  isOpen,
  userLocation,
}) => {
  if (filteredTrucks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p>No food trucks found in your area.</p>
        <p className="text-sm mt-2">Try expanding your search radius or check back later!</p>
      </div>
    );
  }

  return (
    <Accordion 
      type="single" 
      collapsible 
      value={selectedTruckId}
      onValueChange={(value) => setSelectedTruckId(value || undefined)}
      className="space-y-2"
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
};
