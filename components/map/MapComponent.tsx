'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import { FoodTruck } from '@/lib/types';

interface MapComponentProps {
  readonly trucks: FoodTruck[];
  readonly userLocation?: { lat: number; lng: number };
  readonly defaultCenter: LatLngExpression;
  readonly defaultZoom?: number;
  readonly onSelectTruck?: (truckId: string) => void;
  readonly selectedTruckLocation?: LatLngExpression;
}

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
  return <></>;
};

const foodTruckIcon = new L.Icon({
  iconUrl: '/food-truck-icon.svg',
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
  className: 'food-truck-marker-icon',
});

const MapComponent: React.FC<MapComponentProps> = ({
  trucks,
  userLocation,
  defaultCenter,
  defaultZoom = 10,
  onSelectTruck,
  selectedTruckLocation,
}) => {
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
      style={{ height: '400px', width: '100%' }}
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
          position={[truck.current_location.lat, truck.current_location.lng]}
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
            {truck.current_location.address && <div>{truck.current_location.address}</div>}
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

export default MapComponent;
