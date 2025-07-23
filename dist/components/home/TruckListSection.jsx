import { TruckAccordionContent } from './TruckAccordionContent';
import { TruckListHeader } from './TruckListHeader'; // Import the new component
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
export function TruckListSection({ filteredTrucks, selectedTruckId, setSelectedTruckId, isOpen, userLocation, }) {
    return (<div className="lg:col-span-1 space-y-4">
      <TruckListHeader truckCount={filteredTrucks.length}/>
      <TruckAccordionContent filteredTrucks={filteredTrucks} selectedTruckId={selectedTruckId} setSelectedTruckId={setSelectedTruckId} isOpen={isOpen} userLocation={userLocation}/>
    </div>);
}
