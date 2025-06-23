'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';
import TruckMarkers from './map/TruckMarkers';
import { MapViewUpdater } from './map/MapViewUpdater';

interface MapDisplayProps {
  readonly trucks: Array<{
    id: string;
    name: string;
    current_location: {
      lat?: number;
      lng?: number;
      address?: string;
    };
  }>;
  readonly userLocation?: { lat: number; lng: number };
  readonly defaultCenter: LatLngExpression;
  readonly defaultZoom?: number;
  readonly onSelectTruck?: (truckId: string) => void;
  readonly selectedTruckLocation?: LatLngExpression;
}

export default function MapDisplay({
  trucks,
  userLocation,
  defaultCenter,
  defaultZoom = 10,
  onSelectTruck,
  selectedTruckLocation,
}: MapDisplayProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const initialMapCenter: LatLngExpression =
    userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number'
      ? [userLocation.lat, userLocation.lng]
      : defaultCenter;

  if (!isMounted) {
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
      <TruckMarkers trucks={trucks} onSelectTruck={onSelectTruck} />
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
