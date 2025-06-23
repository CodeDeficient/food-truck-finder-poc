'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';
import TruckMarkers from './map/TruckMarkers';
import { MapViewUpdater } from './map/MapViewUpdater';
import { MapLoadingFallback } from './map/MapLoadingFallback';
import { MapContent } from './map/MapContent'; // New import for extracted component

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

function getInitialMapCenter(
  userLocation: { lat: number; lng: number } | undefined,
  defaultCenter: LatLngExpression
): LatLngExpression {
  return userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number'
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;
}

function UserLocationMarker({ userLocation }: { userLocation?: { lat: number; lng: number } }) {
  if (!userLocation) return null;
  return (
    <Marker position={[userLocation.lat, userLocation.lng]}>
      <Popup>You are here</Popup>
    </Marker>
  );
}

export default function MapDisplay(props: MapDisplayProps) {
  const {
    trucks,
    userLocation,
    defaultCenter,
    defaultZoom = 10,
    onSelectTruck,
    selectedTruckLocation,
  } = props;
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const initialMapCenter = getInitialMapCenter(userLocation, defaultCenter);

  if (!isMounted) {
    return <MapLoadingFallback />;
  }

  return (
    <MapContent
      initialMapCenter={initialMapCenter}
      defaultZoom={defaultZoom}
      selectedTruckLocation={selectedTruckLocation}
      trucks={trucks}
      onSelectTruck={onSelectTruck}
      userLocation={userLocation}
    />
  );
}
