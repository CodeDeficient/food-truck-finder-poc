import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';

interface MapViewUpdaterProps {
  readonly center: LatLngExpression | undefined;
  readonly zoom?: number;
}

export function MapViewUpdater({ center, zoom }: Readonly<MapViewUpdaterProps>) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, zoom ?? map.getZoom());
    }
  }, [center, zoom, map]);
  return <></>;
}
