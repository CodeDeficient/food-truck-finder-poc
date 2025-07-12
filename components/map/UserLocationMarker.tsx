import { Marker, Popup } from 'react-leaflet';


interface UserLocationMarkerProps {
  readonly userLocation?: { lat: number; lng: number };
}

export function UserLocationMarker({ userLocation }: UserLocationMarkerProps) {
  if (!userLocation) return;
  return (
    <Marker position={[userLocation.lat, userLocation.lng]}>
      <Popup>You are here</Popup>
    </Marker>
  );
}
