'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react'; // Added useState

interface MapDisplayProps {
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
  // defaultCenter will be the initial, stable center
  defaultCenter: LatLngExpression;
  defaultZoom?: number;
  onSelectTruck?: (truckId: string) => void;
  selectedTruckLocation?: LatLngExpression;
}

// Component to handle map view updates
const MapViewUpdater = ({
  center,
  zoom,
}: {
  center: LatLngExpression | undefined;
  zoom?: number;
}) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  // Empty fragment instead of null
  return <></>;
};

// Custom food truck icon (public/placeholder-logo.png or use your own svg/png)
const foodTruckIcon = new L.Icon({
  iconUrl: '/placeholder-logo.png',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36],
  className: 'food-truck-marker-icon',
});

const MapDisplay = ({
  trucks,
  userLocation,
  defaultCenter, // No longer has a default here, will be passed from parent
  defaultZoom = 10,
  onSelectTruck,
  selectedTruckLocation,
}: MapDisplayProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validTrucks = trucks.filter(
    (truck) =>
      truck.current_location &&
      typeof truck.current_location.lat === 'number' &&
      typeof truck.current_location.lng === 'number',
  );

  // initialMapCenter is derived from defaultCenter prop or userLocation if available.
  const initialMapCenter: LatLngExpression =
    userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number'
      ? [userLocation.lat, userLocation.lng]
      : defaultCenter;

  if (!isMounted) {
    // You can return a placeholder or null until the component is mounted
    // This helps prevent Leaflet from initializing on a container that might be
    // part of a double-render in StrictMode before full client-side hydration.
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f0f0f0',
        }}
      >
        <p>Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={initialMapCenter}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapViewUpdater
        center={selectedTruckLocation}
        zoom={selectedTruckLocation ? 13 : undefined}
      />
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
            <div>{truck.current_location.address || 'Location not available'}</div>
          </Popup>
        </Marker>
      ))}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapDisplay;
