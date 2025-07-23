import { Marker, Popup } from 'react-leaflet';
export function UserLocationMarker({ userLocation }) {
    if (!userLocation)
        return;
    return (<Marker position={[userLocation.lat, userLocation.lng]}>
      <Popup>You are here</Popup>
    </Marker>);
}
