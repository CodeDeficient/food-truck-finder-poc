'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import { useEffect, useState, useMemo } from 'react';
import MapMarkers from './MapMarkers';

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
      map.flyTo(center, zoom ?? map.getZoom());
    }
  }, [center, zoom, map]);
  
  return null;
};

const MapDisplay = ({
  trucks,
  userLocation,
  defaultCenter,
  defaultZoom = 10,
  onSelectTruck,
  selectedTruckLocation,
}: MapDisplayProps) => {
  const [isClient, setIsClient] = useState(false);
  
  // Ensure component only renders on the client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter trucks with valid coordinates
  const validTrucks = useMemo(() => 
    trucks.filter(
      (truck) =>
        truck.current_location != null &&
        typeof truck.current_location.lat === 'number' &&
        typeof truck.current_location.lng === 'number'
    ), [trucks]
  );

  // Calculate map center based on user location or default
  const mapCenter: LatLngExpression = useMemo(() => {
    if (userLocation && 
        typeof userLocation.lat === 'number' && 
        typeof userLocation.lng === 'number') {
      return [userLocation.lat, userLocation.lng];
    }
    return defaultCenter;
  }, [userLocation, defaultCenter]);

  // Show loading state until component is mounted client-side
  if (!isClient) {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          minHeight: '400px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
        }}
      >
        <div style={{ textAlign: 'center', color: '#666' }}>
          <p>Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <MapContainer
      center={mapCenter}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      style={{ 
        height: '100%', 
        width: '100%',
        minHeight: '400px'
      }}
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
      <MapMarkers trucks={validTrucks} userLocation={userLocation} onSelectTruck={onSelectTruck} />
    </MapContainer>
  );
};

export default MapDisplay;
