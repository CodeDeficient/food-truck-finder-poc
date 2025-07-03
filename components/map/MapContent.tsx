'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import TruckMarkers from './TruckMarkers';
import { MapViewUpdater } from './MapViewUpdater';
import { UserLocationMarker } from './UserLocationMarker';

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
