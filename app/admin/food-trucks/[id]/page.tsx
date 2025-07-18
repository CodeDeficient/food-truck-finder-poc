
import { FoodTruckService, type FoodTruck } from '@/lib/supabase';
import { isFoodTruck } from '@/lib/utils/typeGuards';
import {
  categorizeQualityScore,
  getQualityBadgeClasses,
} from '@/lib/utils/dataQualityFormatters';
import { BasicInfoCard } from '@/components/admin/food-trucks/detail/BasicInfoCard';
import ContactInfoCard from '@/components/admin/food-trucks/detail/ContactInfoCard';
import { DataQualityCard } from '@/components/admin/food-trucks/detail/DataQualityCard';
import { LocationInfoCard } from '@/components/admin/food-trucks/detail/LocationInfoCard';
import { OperatingHoursCard } from '@/components/admin/food-trucks/detail/OperatingHoursCard';
import { RatingsReviewsCard } from '@/components/admin/food-trucks/detail/RatingsReviewsCard';
import { TruckDetailHeader } from '@/components/admin/food-trucks/detail/TruckDetailHeader';
import { TruckNotFound } from '@/components/admin/food-trucks/detail/TruckNotFound';

interface FoodTruckDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

/**
* Fetches and displays detailed information about a specific food truck.
* @example
* FoodTruckDetailPage({ params: { id: '123' } })
* Displays detailed information components for the food truck with id '123'
* @param {FoodTruckDetailPageProps} {params} - Contains route parameters including the truck id.
* @returns {JSX.Element} JSX elements representing the detailed page of a food truck or a not found message.
* @description
*   - Retrieves a food truck's data by its identification from the service.
*   - Categorizes the quality score of the food truck for display purposes.
*   - Uses multiple components to separately show different aspects of the food truck's details.
*   - Returns a fallback component if the truck data is not found.
*/
export default async function FoodTruckDetailPage({ params }: FoodTruckDetailPageProps) {
  const resolvedParams = await params;
  const truckResult = await FoodTruckService.getTruckById(resolvedParams.id);

  if (!isFoodTruck(truckResult)) {
    return <TruckNotFound />;
  }

  const truck: FoodTruck = truckResult;

  const dataQualityScore = typeof truck.data_quality_score === 'number' ? truck.data_quality_score : 0;

  return (
    <div className="flex flex-col gap-6">
      <TruckDetailHeader
        truck={truck}
        badgeClasses={getQualityBadgeClasses(dataQualityScore)}
        qualityCategory={categorizeQualityScore(dataQualityScore)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicInfoCard truck={truck} />
        <ContactInfoCard phone={truck.contact_info?.phone} email={truck.contact_info?.email} website={truck.contact_info?.website} />
        <LocationInfoCard truck={truck} />
        <OperatingHoursCard truck={truck} />
        <RatingsReviewsCard truck={truck} />
      </div>

      <DataQualityCard truck={truck} qualityCategory={categorizeQualityScore(dataQualityScore)} />
    </div>
  );
}
