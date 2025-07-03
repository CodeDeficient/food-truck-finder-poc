import React from 'react';
import TruckCard from '@/components/ui/TruckCard';

// Additional imports for Rating, Menu, Contact sections
import { FoodTruck, DailyOperatingHours as Hours, MenuItem } from '@/lib/types';
interface TruckCardContentProps {
  readonly foodTruck: Readonly<FoodTruck>;
  readonly todayHours: Readonly<Hours> | undefined;
  readonly popularItems: ReadonlyArray<MenuItem>;
}

export function TruckCardContent({ foodTruck, todayHours, popularItems }: TruckCardContentProps) {
  return (
    <div className="card-container">
      <TruckCard foodTruck={foodTruck} />
      {/* Add Rating, Menu, and Contact sections here */}
      <div className="card-description">
        {foodTruck.description}
      </div>
      {/* Handle hours availability */}
      <div className="card-hours">
        {todayHours ? (
          <div>Open until {todayHours.closing}</div>
        ) : (
          <p>Hours unavailable</p>
        )}
      </div>
    </div>
  );
}
