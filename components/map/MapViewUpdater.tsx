import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

interface MapViewUpdaterProps {
  center: LatLngExpression | undefined;
  zoom?: number;
}

export function MapViewUpdater({ center, zoom }: MapViewUpdaterProps) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom ?? map.getZoom());
    }
  }, [center, zoom, map]);
  return <></>;
}
