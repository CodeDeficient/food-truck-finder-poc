
import React from 'react';
import { FoodTruck } from '@/lib/types'; // Assuming FoodTruck type is here

interface TruckAccordionContentProps {
  filteredTrucks: FoodTruck[];
  selectedTruckId: string | undefined;
  setSelectedTruckId: (id: string | undefined) => void;
  isOpen: (truck: FoodTruck) => boolean;
  userLocation: { lat: number; lng: number } | undefined;
}

export const TruckAccordionContent: React.FC<TruckAccordionContentProps> = ({
  filteredTrucks,
}) => {
  return (
    <div>
      {/* This is a placeholder component. Actual accordion content will go here. */}
      {filteredTrucks.map((truck) => (
        <div key={truck.id}>
          <h3>{truck.name}</h3>
          {/* Add more truck details here */}
        </div>
      ))}
    </div>
  );
};
