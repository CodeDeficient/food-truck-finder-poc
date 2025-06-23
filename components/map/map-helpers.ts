import type { LatLngExpression } from 'leaflet';

export function getInitialMapCenter(
  userLocation: { lat: number; lng: number } | undefined,
  defaultCenter: LatLngExpression
): LatLngExpression {
  return userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number'
    ? [userLocation.lat, userLocation.lng]
    : defaultCenter;
}
