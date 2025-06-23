'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import type { LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';
import { MapLoadingFallback } from './map/MapLoadingFallback';
import { MapContent } from './map/MapContent';
import { getInitialMapCenter } from './map/map-helpers';
// Removed UserLocationMarker import from here, as it's now rendered inside MapContent

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
      userLocation={userLocation} // Pass userLocation to MapContent
    />
  );
}
