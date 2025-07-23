import dynamic from 'next/dynamic';
const DynamicMapComponent = dynamic(() => import('@/components/map/MapComponent').then((mod) => mod.default), {
    ssr: false,
    loading: () => (<div style={{ height: '400px', background: '#f0f0f0' }}>
        <p>Loading map...</p>
      </div>),
});
// Helper function to get selected truck location
function getSelectedTruckLocation(selectedTruckId, filteredTrucks) {
    var _a, _b;
    if (selectedTruckId == undefined)
        return undefined;
    const truck = filteredTrucks.find((t) => t.id === selectedTruckId);
    return ((_a = truck === null || truck === void 0 ? void 0 : truck.current_location) === null || _a === void 0 ? void 0 : _a.lat) == undefined || ((_b = truck === null || truck === void 0 ? void 0 : truck.current_location) === null || _b === void 0 ? void 0 : _b.lng) == undefined
        ? undefined
        : [truck.current_location.lat, truck.current_location.lng];
}
/**
 * MapSection component responsible for rendering the map with truck locations and user location.
 * @example
 * MapSection({
 *   filteredTrucks: [{ id: 1, location: { lat: 37.7749, lng: -122.4194 } }],
 *   userLocation: { lat: 37.7749, lng: -122.4194 },
 *   selectedTruckId: 1,
 *   setSelectedTruckId: (id) => console.log(id),
 * })
 * // Returns a div component containing a DynamicMap component
 * @param {Array<Object>} filteredTrucks - List of filtered truck objects with their id and location.
 * @param {Object} userLocation - Object containing the latitude and longitude of the user's location.
 * @param {number} selectedTruckId - Identifier for the currently selected truck on the map.
 * @param {Function} setSelectedTruckId - Callback function to set the ID of the selected truck.
 * @returns {JSX.Element} Returns a div container with embedded DynamicMap component.
 * @description
 *   - Uses DynamicMap component to render trucks and user on the map.
 *   - Falls back to a default location if userLocation is not provided.
 *   - Highlights selected truck's location on the map.
 *   - Applies styling to ensure responsive map dimensions.
 */
export function MapSection({ filteredTrucks, userLocation, selectedTruckId, setSelectedTruckId, theme, }) {
    var _a, _b;
    // Added readonly
    return (<div className="lg:col-span-2 h-80 min-h-[320px] sm:h-96 sm:min-h-[400px] dark:bg-slate-800 rounded-lg shadow">
      <DynamicMapComponent trucks={filteredTrucks} userLocation={userLocation} onSelectTruck={setSelectedTruckId} defaultCenter={[
            (_a = userLocation === null || userLocation === void 0 ? void 0 : userLocation.lat) !== null && _a !== void 0 ? _a : 0,
            (_b = userLocation === null || userLocation === void 0 ? void 0 : userLocation.lng) !== null && _b !== void 0 ? _b : 0,
        ]} selectedTruckLocation={getSelectedTruckLocation(selectedTruckId, filteredTrucks)} theme={theme}/>
    </div>);
}
