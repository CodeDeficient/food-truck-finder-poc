import React from 'react';
import { FoodTruckService, type FoodTruck, type OperatingHours } from '@/lib/supabase';
import {
  formatQualityScore,
  categorizeQualityScore,
  getQualityBadgeClasses,
  type QualityCategory
} from '@/lib/utils/dataQualityFormatters';
import { BasicInfoCard } from '@/components/admin/food-trucks/detail/BasicInfoCard';
import { ContactInfoCard } from '@/components/admin/food-trucks/detail/ContactInfoCard';
import { DataQualityCard } from '@/components/admin/food-trucks/detail/DataQualityCard';
import { LocationInfoCard } from '@/components/admin/food-trucks/detail/LocationInfoCard';
import { OperatingHoursCard } from '@/components/admin/food-trucks/detail/OperatingHoursCard';
import { RatingsReviewsCard } from '@/components/admin/food-trucks/detail/RatingsReviewsCard';
import { TruckDetailHeader } from '@/components/admin/food-trucks/detail/TruckDetailHeader';
import { TruckNotFound } from '@/components/admin/food-trucks/detail/TruckNotFound';

interface FoodTruckDetailPageProps {
  readonly params: {
    readonly id: string;
  };
}

interface TruckProps {
  truck: FoodTruck;
}

export default async function FoodTruckDetailPage({ params }: FoodTruckDetailPageProps) {
  const truck = await FoodTruckService.getTruckById(params.id);

  if (truck == undefined) {
    return <TruckNotFound />;
  }

  const qualityCategory: QualityCategory = categorizeQualityScore(truck.data_quality_score);
  const badgeClasses: string = getQualityBadgeClasses(truck.data_quality_score);

  return (
    <div className="flex flex-col gap-6">
      <TruckDetailHeader truck={truck} badgeClasses={badgeClasses} qualityCategory={qualityCategory} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BasicInfoCard truck={truck} />
        <ContactInfoCard truck={truck} />
        <LocationInfoCard truck={truck} />
        <OperatingHoursCard truck={truck as { operating_hours?: Record<string, { closed?: boolean; open?: string; close?: string }> }} />
        <RatingsReviewsCard truck={truck as { average_rating?: number; review_count?: number }} />
      </div>

      <DataQualityCard truck={truck} qualityCategory={qualityCategory} />
    </div>
  );
}
