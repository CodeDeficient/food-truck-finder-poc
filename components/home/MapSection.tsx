import React from 'react';
import dynamic from 'next/dynamic';
import { FoodTruck } from '@/lib/types/foodTruck';

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
      <p>Loading map...</p>
    </div>
  ),
});

// Helper function to get selected truck location
function getSelectedTruckLocation(
  selectedTruckId: string | undefined,
  filteredTrucks: FoodTruck[]
): [number, number] | undefined {
  if (selectedTruckId === undefined) return undefined;

  const truck = filteredTrucks.find((t) => t.id === selectedTruckId);
  return (truck?.current_location?.lat == undefined) || (truck?.current_location?.lng == undefined)
    ? undefined
    : [truck.current_location.lat, truck.current_location.lng];
}

interface MapSectionProps {
  readonly filteredTrucks: FoodTruck[];
  readonly userLocation: { lat: number; lng: number } | undefined;
  readonly selectedTruckId: string | undefined;
  readonly setSelectedTruckId: (id: string | undefined) => void;
}

export function MapSection({
  filteredTrucks,
  userLocation,
  selectedTruckId,
  setSelectedTruckId
}: Readonly<MapSectionProps>) { // Added readonly
  return (
    <div
      key="map-container-parent"
      className="lg:col-span-2 h-80 min-h-[320px] sm:h-96 sm:min-h-[400px] dark:bg-slate-800 rounded-lg shadow"
    >
      <MapDisplay
        trucks={filteredTrucks}
        userLocation={userLocation}
        onSelectTruck={setSelectedTruckId}
        defaultCenter={
          userLocation ? [userLocation.lat, userLocation.lng] : [37.7749, -122.4194]
        }
        selectedTruckLocation={getSelectedTruckLocation(selectedTruckId, filteredTrucks)}
      />
    </div>
  );
}
