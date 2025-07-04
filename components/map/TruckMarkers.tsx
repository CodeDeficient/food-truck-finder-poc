import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

interface TruckMarkersProps {
  readonly trucks: Array<{
    id: string;
    name: string;
    current_location: {
      lat?: number;
      lng?: number;
      address?: string;
    };
  }>;
  readonly onSelectTruck?: (truckId: string) => void;
}

// Custom food truck icon
const foodTruckIcon = new L.Icon({
  iconUrl: '/food-truck-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'food-truck-marker-icon',
});

/**
* Renders map markers for trucks with valid locations and handles click events.
* @example
* TruckMarkers({ trucks: arrayOfTrucks, onSelectTruck: handleTruckSelect })
* Returns JSX elements rendering markers on a map for valid trucks.
* @param {Array} {trucks} - An array of truck objects to be processed.
* @param {Function} {onSelectTruck} - A callback function to handle truck selection via clicks.
* @returns {JSX.Element} A JSX fragment containing map markers for trucks.
* @description
*   - Filters trucks to only include those with defined current locations and valid latitude and longitude values.
*   - Uses a custom icon (`foodTruckIcon`) for displaying truck markers on the map.
*   - Ensures that clicking on a marker triggers the provided `onSelectTruck` function with the truck's ID.
*   - Displays a popup with the truck's name and address if available, upon clicking the marker.
*/
const TruckMarkers: React.FC<TruckMarkersProps> = ({ trucks, onSelectTruck }) => {
  const validTrucks = trucks.filter(
    (truck) =>
      truck.current_location != undefined &&
      typeof truck.current_location.lat === 'number' &&
      typeof truck.current_location.lng === 'number',
  );

  return (
    <>
      {validTrucks.map((truck) => (
        <Marker
          key={truck.id}
          position={[truck.current_location.lat!, truck.current_location.lng!]}
          icon={foodTruckIcon}
          eventHandlers={{
            click: () => {
              if (onSelectTruck) {
                onSelectTruck(truck.id);
              }
            },
          }}
        >
          <Popup>
            <h4 className="font-bold">{truck.name}</h4>
            {truck.current_location.address != undefined &&
              truck.current_location.address != '' && <div>{truck.current_location.address}</div>}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default TruckMarkers;
