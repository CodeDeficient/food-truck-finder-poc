import React from 'react';

interface TruckListHeaderProps {
  readonly truckCount: number;
}

export function TruckListHeader({ truckCount }: TruckListHeaderProps) {
  return (
    <h3 className="text-lg font-semibold dark:text-gray-100">
      Nearby Trucks ({truckCount})
    </h3>
  );
}
