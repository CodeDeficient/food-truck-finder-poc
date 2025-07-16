'use client';

import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import * as L from 'leaflet';

// Custom food truck icon
const foodTruckIcon = new L.Icon({
  iconUrl: '/food-truck-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'food-truck-marker-icon',
});

interface MapMarkersProps {
  trucks: Array<{
    id: string;
    name: string;
    current_location: {
      lat?: number;
      lng?: number;
      address?: string;
    };
  }>;
  userLocation?: { lat: number; lng: number };
  onSelectTruck?: (truckId: string) => void;
}

const MapMarkers: React.FC<MapMarkersProps> = ({ trucks, userLocation, onSelectTruck }) => (
  <>
    {/* Render food truck markers */}
    {trucks.map((truck) => (
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
          {truck.current_location.address && (
            <div>{truck.current_location.address}</div>
          )}
        </Popup>
      </Marker>
    ))}
    
    {/* Render user location marker if available */}
    {userLocation && (
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>You are here</Popup>
      </Marker>
    )}
  </>
);

export default MapMarkers;
