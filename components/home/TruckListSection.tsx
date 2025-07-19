
import type { FoodTruck } from '@/lib/supabase/types';
import { TruckAccordionContent } from './TruckAccordionContent';
import { TruckListHeader } from './TruckListHeader'; // Import the new component

interface TruckListSectionProps {
  readonly filteredTrucks: FoodTruck[];
  readonly selectedTruckId: string | undefined;
  readonly setSelectedTruckId: (id: string | undefined) => void;
  readonly isOpen: (truck: FoodTruck) => boolean;
  readonly userLocation: { lat: number; lng: number } | undefined;
  readonly formatPrice: (price: string | number) => string;
}

/**
 * Renders a section with a list of trucks and provides interactions for the user.
 * @example
 * TruckListSection({
 *   filteredTrucks: [
 *     { id: 1, name: 'Truck A' },
 *     { id: 2, name: 'Truck B' }
 *   ],
 *   selectedTruckId: 1,
 *   setSelectedTruckId: (id) => { /* set selected truck id */
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
