import React from 'react';
import { getFoodTruckDetails } from '@/hooks/useFoodTruckDetails';
import { TruckDetailHeader } from '@/components/trucks/TruckDetailHeader';
import { TruckNotFound } from '@/components/trucks/TruckNotFound';
import { TruckBasicInfo } from '@/components/trucks/TruckBasicInfo';
import { TruckContactInfo } from '@/components/trucks/TruckContactInfo';
import { TruckLocationInfo } from '@/components/trucks/TruckLocationInfo';
import { TruckOperatingHours } from '@/components/trucks/TruckOperatingHours';
import { TruckRatingsReviews } from '@/components/trucks/TruckRatingsReviews';

interface FoodTruckDetailPageProps {
  readonly params: {
    readonly id: string;
  };
}

export default async function FoodTruckDetailPage({ params }: FoodTruckDetailPageProps) {
  const truck = await getFoodTruckDetails(params.id);

  if (truck == null) {
    return <TruckNotFound />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-6 max-w-4xl mx-auto">
          <TruckDetailHeader truckName={truck.name} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TruckBasicInfo truck={truck} />

            <TruckContactInfo truck={truck} />

            <TruckLocationInfo truck={truck} />

            <TruckOperatingHours truck={truck} />
          </div>

          <TruckRatingsReviews truck={truck} />
        </div>
      </div>
    </div>
  );
}
