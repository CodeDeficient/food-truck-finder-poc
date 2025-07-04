import React from 'react';
import { FoodTruck } from '@/lib/types';
import { MapSection } from './MapSection';
import { TruckListSection } from './TruckListSection';
import { formatPrice } from '@/lib/utils/foodTruckHelpers';

interface MainContentProps {
  readonly filteredTrucks: FoodTruck[];
  readonly userLocation: { lat: number; lng: number } | undefined;
  readonly selectedTruckId: string | undefined;
  readonly setSelectedTruckId: (id: string | undefined) => void;
  readonly isOpen: (truck: FoodTruck) => boolean;
}

/**
 * Renders the main content area, including a map and a list of trucks.
 * @example
 * MainContent({
 *   filteredTrucks: [{ id: 1, name: 'Truck A' }, { id: 2, name: 'Truck B' }],
 *   userLocation: { lat: 34.0522, lng: -118.2437 },
 *   selectedTruckId: 1,
 *   setSelectedTruckId: (id) => console.log(id),
 *   isOpen: true
 * })
 * <div>...</div>
 * @param {Array} filteredTrucks - Array of truck objects to be displayed.
 * @param {Object} userLocation - Current location of the user.
 * @param {number} selectedTruckId - ID of the currently selected truck.
 * @param {Function} setSelectedTruckId - Function to update the selected truck ID.
 * @param {boolean} isOpen - State indicating whether the truck list section is open.
 * @returns {JSX.Element} The rendered main content of the page.
 * @description
 *   - Contains two main components: MapSection and TruckListSection.
 *   - Utilizes Tailwind CSS for styling.
 *   - MainContent is integrated in the home page.
 */
export function MainContent({
  filteredTrucks,
  userLocation,
  selectedTruckId,
  setSelectedTruckId,
  isOpen,
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
