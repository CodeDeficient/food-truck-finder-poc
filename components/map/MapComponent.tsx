'use client';

import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';
import type { FoodTruck } from '@/lib/types';
import { isTruckOpen } from '@/lib/utils/foodTruckHelpers';
import { geocodeAddress, CHARLESTON_FALLBACK } from '@/lib/utils/geocoding';

interface MapComponentProps {
  readonly trucks: FoodTruck[];
  readonly userLocation?: { lat: number; lng: number };
  readonly defaultCenter: LatLngExpression;
  readonly defaultZoom?: number;
  readonly onSelectTruck?: (truckId: string) => void;
  readonly selectedTruckLocation?: LatLngExpression;
  readonly theme?: string;
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

const getFoodTruckIcon = (isOpen: boolean, theme: string) => {
  const color = isOpen ? 'green' : 'red';
  return new L.Icon({
    iconUrl: '/food-truck-icon.svg',
    iconSize: [64, 64],
    iconAnchor: [32, 52], // Adjusted for better pin positioning
    popupAnchor: [0, -52],
    shadowUrl: undefined, // Use CSS shadow instead
    className: `food-truck-marker-icon glow-${color}`
  });
};

const MapComponent: React.FC<MapComponentProps> = ({
  trucks,
  userLocation,
  defaultCenter,
  defaultZoom = 10,
  onSelectTruck,
  selectedTruckLocation,
  theme,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const [trucksWithCoords, setTrucksWithCoords] = useState<FoodTruck[]>([]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Process trucks to ensure all have coordinates - no geocoding delays
  useEffect(() => {
    if (!trucks.length) {
      setTrucksWithCoords([]);
      return;
    }
    
    console.log('🗺️ Processing', trucks.length, 'trucks for map display');
    
    const processedTrucks: FoodTruck[] = trucks.map(truck => {
      if (!truck.current_location) {
        console.warn('⚠️ Skipping truck with no location:', truck.name);
        return null;
      }
      
      // Ensure truck has valid coordinates, use fallback if needed
      const lat = truck.current_location.lat || CHARLESTON_FALLBACK.lat;
      const lng = truck.current_location.lng || CHARLESTON_FALLBACK.lng;
      
      return {
        ...truck,
        current_location: {
          ...truck.current_location,
          lat,
          lng,
        },
      };
    }).filter((truck): truck is FoodTruck => truck !== null);
    
    console.log('🎯 Processed trucks for map:', processedTrucks.length);
    setTrucksWithCoords(processedTrucks);
  }, [trucks]);

  const validTrucks = trucksWithCoords;

  const initialMapCenter: LatLngExpression =
    userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number'
      ? [userLocation.lat, userLocation.lng]
      : defaultCenter;

  // Choose tile layer based on theme - modern Google Maps style dark theme
  const isDark = theme === 'dark';
  const tileLayerProps = isDark
    ? {
        // Jawg Dark - modern dark theme with highlighted roads like Google Maps
        attribution: '&copy; <a href="https://www.jawg.io" target="_blank">&copy; Jawg</a> - &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        url: 'https://tile.jawg.io/jawg-dark/{z}/{x}/{y}{r}.png?access-token=community',
        // Add custom styling for modern dark mode
        className: 'modern-dark-map-tiles'
      }
    : {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      };

  if (!isMounted) {
    return (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDark ? '#000' : '#f0f0f0',
        }}
      >
        <p style={{ color: isDark ? '#fff' : '#000' }}>Loading map...</p>
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
        attribution={tileLayerProps.attribution}
        url={tileLayerProps.url}
      />
      <MapViewUpdater
        center={selectedTruckLocation}
        zoom={selectedTruckLocation ? 13 : undefined}
      />
      {validTrucks.map((truck) => {
        const isOpen = isTruckOpen(truck);
        return (
          <Marker
            key={truck.id}
            position={[truck.current_location.lat, truck.current_location.lng]}
            icon={getFoodTruckIcon(isOpen, theme || 'light')}
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
              <div className={isOpen ? 'text-green-600' : 'text-red-600'}>
                {isOpen ? 'Open' : 'Closed'}
              </div>
            </Popup>
          </Marker>
        );
      })}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapComponent;
