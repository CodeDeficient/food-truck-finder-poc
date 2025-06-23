import { Marker, Popup } from 'react-leaflet';
import React from 'react';

interface UserLocationMarkerProps {
  readonly userLocation?: { lat: number; lng: number };
}

export function UserLocationMarker({ userLocation }: UserLocationMarkerProps) {
  if (!userLocation) return null;
  return (
    <Marker position={[userLocation.lat, userLocation.lng]}>
      <Popup>You are here</Popup>
    </Marker>
  );
}
