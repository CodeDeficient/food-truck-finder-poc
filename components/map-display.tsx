"use client"

import "leaflet/dist/leaflet.css"
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.webpack.css" // Re-uses images from ~leaflet package
import "leaflet-defaulticon-compatibility"

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import type { LatLngExpression } from "leaflet"

interface MapDisplayProps {
  trucks: Array<{
    id: string
    name: string
    current_location: {
      lat?: number
      lng?: number
      address?: string
    }
  }>
  userLocation?: { lat: number; lng: number } | null
  defaultCenter?: LatLngExpression
  defaultZoom?: number
}

const MapDisplay = ({
  trucks,
  userLocation,
  defaultCenter = [37.7749, -122.4194], // Default to San Francisco
  defaultZoom = 10,
}: MapDisplayProps) => {
  const validTrucks = trucks.filter(
    (truck) =>
      truck.current_location &&
      typeof truck.current_location.lat === "number" &&
      typeof truck.current_location.lng === "number",
  )

  const mapCenter = userLocation
    ? [userLocation.lat, userLocation.lng]
    : validTrucks.length > 0 && validTrucks[0].current_location.lat && validTrucks[0].current_location.lng
      ? [validTrucks[0].current_location.lat, validTrucks[0].current_location.lng]
      : defaultCenter

  return (
    <MapContainer
      center={mapCenter}
      zoom={defaultZoom}
      scrollWheelZoom={true}
      style={{ height: "100%", width: "100%" }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validTrucks.map((truck) => (
        <Marker
          key={truck.id}
          position={[truck.current_location.lat!, truck.current_location.lng!]}
        >
          <Popup>
            <h4 className="font-bold">{truck.name}</h4>
            {truck.current_location.address && <p>{truck.current_location.address}</p>}
          </Popup>
        </Marker>
      ))}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  )
}

export default MapDisplay
