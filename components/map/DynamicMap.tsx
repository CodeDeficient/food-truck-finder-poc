'use client';

import dynamic from 'next/dynamic';
import { FoodTruck } from '@/lib/types';
import { LatLngExpression } from 'leaflet';

const MapDisplay = dynamic(
  () => import('@/components/map/MapContent').then((mod) => mod.default),
  {
    ssr: false,
  },
);

interface DynamicMapProps {
  readonly trucks: FoodTruck[];
  readonly userLocation?: { lat: number; lng: number };
  readonly defaultCenter: LatLngExpression;
  readonly defaultZoom?: number;
  readonly onSelectTruck?: (truckId: string) => void;
  readonly selectedTruckLocation?: LatLngExpression;
}

export default function DynamicMap(props: DynamicMapProps) {
  return <MapDisplay {...props} />;
}
