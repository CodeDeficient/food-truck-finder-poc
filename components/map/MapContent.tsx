'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import TruckMarkers from './TruckMarkers';
import { MapViewUpdater } from './MapViewUpdater';

interface MapContentProps {
  readonly initialMapCenter: LatLngExpression;
  readonly defaultZoom?: number;
  readonly selectedTruckLocation?: LatLngExpression;
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
  readonly userLocation?: { lat: number; lng: number };
}

export function MapContent({
  initialMapCenter,
  defaultZoom = 10,
  selectedTruckLocation,
  trucks,
  onSelectTruck,
  userLocation,
}: MapContentProps) {
  function UserLocationMarker({ userLocation }: { userLocation?: { lat: number; lng: number } }) {
    if (!userLocation) return null;
    return (
      <Marker position={[userLocation.lat, userLocation.lng]}>
        <Popup>You are here</Popup>
      </Marker>
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
      <TruckMarkers trucks={trucks} onSelectTruck={onSelectTruck} />
      <UserLocationMarker userLocation={userLocation} />
    </MapContainer>
  );
}
