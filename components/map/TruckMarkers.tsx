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
            {truck.current_location.address != undefined && truck.current_location.address != '' && <div>{truck.current_location.address}</div>}
          </Popup>
        </Marker>
      ))}
    </>
  );
};

export default TruckMarkers;
