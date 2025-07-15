
import { AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { TruckCard } from '@/components/TruckCard';
import { FoodTruck } from '@/lib/types';

interface TruckAccordionItemProps {
  readonly truck: FoodTruck;
  readonly selectedTruckId: string | undefined;
  readonly setSelectedTruckId: (id: string | undefined) => void;
  readonly isOpen: (truck: FoodTruck) => boolean;
  readonly userLocation: { lat: number; lng: number } | undefined;
}

/**
 * Renders an accordion item displaying truck details and provides interaction handlers.
 * @example
 * TruckAccordionItem({ truck, selectedTruckId, setSelectedTruckId, isOpen, userLocation })
 * Returns a React component representing an accordion item.
 * @param {Object} truck - The truck object containing details like id, name, and location.
 * @param {function} setSelectedTruckId - Function used to update the selected truck ID.
 * @param {boolean} isOpen - Function that determines the open state of the truck.
 * @param {Object} userLocation - The user's current location used in truck comparisons.
 * @returns {JSX.Element} The rendered AccordionItem component.
 * @description
 *   - Uses conditional rendering to display the truck's current location if available.
 *   - Calls isOpen to evaluate and render truck's open/closed status dynamically.
 *   - The accordion triggers user interaction with truck selection for detailed viewing.
 *   - Applies varying styling based on dark/light theme settings in the interface.
 */
export function TruckAccordionItem({
  truck,
  selectedTruckId: _selectedTruckId,
  setSelectedTruckId,
  isOpen,
  userLocation,
}: TruckAccordionItemProps) {
  return (
    <AccordionItem value={truck.id} key={truck.id}>
      <AccordionTrigger className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md">
        <div className="flex-1 text-left">
          <h4 className="font-medium dark:text-gray-100">{truck.name}</h4>
          {Boolean(truck.current_location?.address) && (
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
          hideHeader={true}
        />
      </AccordionContent>
    </AccordionItem>
  );
}
