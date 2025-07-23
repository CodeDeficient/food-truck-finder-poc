import { MapSection } from './MapSection';
import { TruckListSection } from './TruckListSection';
import { formatPrice } from '@/lib/utils/foodTruckHelpers';
/**
 * Renders the main content area, including a map and a list of trucks.
 * This component acts as an adapter, converting the basic userLocation prop
 * into the richer LocationData object required by its children.
 */
export function MainContent({ filteredTrucks, userLocation, selectedTruckId, setSelectedTruckId, isOpen, theme, }) {
    return (<div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MapSection filteredTrucks={filteredTrucks} userLocation={userLocation} selectedTruckId={selectedTruckId} setSelectedTruckId={setSelectedTruckId} theme={theme}/>
          <TruckListSection filteredTrucks={filteredTrucks} selectedTruckId={selectedTruckId} setSelectedTruckId={setSelectedTruckId} isOpen={isOpen} userLocation={userLocation} // Pass the original simple coordinate object
     formatPrice={formatPrice}/>
        </div>
      </div>
    </div>);
}
