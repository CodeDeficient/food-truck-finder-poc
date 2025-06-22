import React from 'react';
import { FoodTruck } from '@/lib/types/foodTruck';
import { MapSection } from './MapSection';
import { TruckListSection } from './TruckListSection';
import { formatPrice } from '@/lib/utils/foodTruckHelpers';

interface MainContentProps {
  filteredTrucks: FoodTruck[];
  userLocation: { lat: number; lng: number } | undefined;
  selectedTruckId: string | undefined;
  setSelectedTruckId: (id: string | undefined) => void;
  isOpen: (truck: FoodTruck) => boolean;
}

export function MainContent({
  filteredTrucks,
  userLocation,
  selectedTruckId,
  setSelectedTruckId,
  isOpen
}: MainContentProps) {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MapSection
            filteredTrucks={filteredTrucks}
            userLocation={userLocation}
            selectedTruckId={selectedTruckId}
            setSelectedTruckId={setSelectedTruckId}
          />
          <TruckListSection
            filteredTrucks={filteredTrucks}
            selectedTruckId={selectedTruckId}
            setSelectedTruckId={setSelectedTruckId}
            isOpen={isOpen}
            userLocation={userLocation}
            formatPrice={formatPrice}
          />
        </div>
      </div>
    </div>
  );
}
