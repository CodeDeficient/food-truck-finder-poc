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

/**
 * Renders an accordion component to display a list of trucks with options for selection.
 * @example
 * TruckAccordionContent({ filteredTrucks, selectedTruckId, setSelectedTruckId, isOpen, userLocation })
 * // Returns a rendered accordion component with trucks as selectable items.
 * @param {Array} filteredTrucks - Array of truck objects to be displayed in the accordion.
 * @param {string} selectedTruckId - The ID of the currently selected truck item.
 * @param {Function} setSelectedTruckId - Callback function to update the selected truck ID.
 * @param {boolean} isOpen - Boolean indicating if the accordion item should be open.
 * @param {object} userLocation - Object representing the user's location.
 * @returns {JSX.Element} Renders an accordion component with the provided truck data and interactions.
 * @description
 *   - Uses the 'Accordion' component with 'single' type mode for handling selections.
 *   - The accordion is designed to be collapsible and spans the full width of its container.
 *   - Selected truck ID is controlled via `onValueChange` to update state based on user interactions.
 */
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
      onValueChange={(value) => setSelectedTruckId(value === '' ? undefined : value)}
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
