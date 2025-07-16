'use client';

import { MapContainer, TileLayer } from 'react-leaflet';
import type { LatLngExpression, Map } from 'leaflet';
import TruckMarkers from './TruckMarkers';
import { MapViewUpdater } from './MapViewUpdater';
import { UserLocationMarker } from './UserLocationMarker';
import { useEffect, useState } from 'react';

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

/**
 * Renders a map with truck markers and user location.
 * @example
 * MapContent({
 *   initialMapCenter: { lat: 51.505, lng: -0.09 },
 *   defaultZoom: 10,
 *   selectedTruckLocation: { lat: 51.51, lng: -0.12 },
 *   trucks: [{ id: 1, location: { lat: 51.51, lng: -0.12 } }],
 *   onSelectTruck: (truck) => console.log(truck),
 *   userLocation: { lat: 51.503, lng: -0.06 },
 * })
 * Returns a MapContainer component with specified props set.
 * @param {Object} MapContentProps - Properties for configuring the map.
 * @param {Object} MapContentProps.initialMapCenter - Initial center of the map.
 * @param {number} [MapContentProps.defaultZoom=10] - Default zoom level for the map.
 * @param {Object} MapContentProps.selectedTruckLocation - Location of the selected truck.
 * @param {Array} MapContentProps.trucks - Array of truck objects to be marked on the map.
 * @param {Function} MapContentProps.onSelectTruck - Callback invoked when a truck is selected.
 * @param {Object} MapContentProps.userLocation - Location of the user on the map.
 * @returns {JSX.Element} MapContainer component configured with truck and user markers.
 * @description
 *   - Utilizes react-leaflet's MapContainer for rendering the map interface.
 *   - Adjusts zoom level if a truck location is selected.
 *   - Integrates tile layer from OpenStreetMap contributors.
 *   - Contains rounded corner styling for map container.
 */
export function MapContent({
  initialMapCenter,
  defaultZoom = 10,
  selectedTruckLocation,
  trucks,
  onSelectTruck,
  userLocation,
}: MapContentProps) {
  const [map, setMap] = useState<Map | null>(null);

  useEffect(() => {
    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  return (
    <MapContainer
      center={initialMapCenter}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
      whenCreated={setMap}
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
