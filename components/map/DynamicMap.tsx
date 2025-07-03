'use client';

import dynamic from 'next/dynamic';
import { FoodTruck } from '@/lib/types';
import { LatLngExpression } from 'leaflet';

const MapContent = dynamic(
  () => import('@/components/map/MapContent').then((mod) => mod.MapContent),
  {
    ssr: false,
    loading: () => (
      <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
        <p>Loading map...</p>
      </div>
    ),
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
  return <MapContent {...props} initialMapCenter={props.defaultCenter} />;
}
