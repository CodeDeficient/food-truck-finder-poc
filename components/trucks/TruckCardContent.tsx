import React from 'react';
import { Badge } from '@/components/ui/badge';
import { FoodTruck } from '@/lib/types/foodTruck';
import { RatingSection } from './RatingSection';
import { MenuSection } from './MenuSection';
import { ContactSection } from './ContactSection';
import { SocialMediaSection } from './SocialMediaSection';
import { OperatingHoursSection } from './OperatingHoursSection';
import { formatHours } from '@/lib/utils/foodTruckHelpers';

interface TruckCardContentProps {
  readonly truck: FoodTruck;
  readonly todayHours?: { open: string; close: string; closed: boolean };
  readonly popularItems: { name: string; price: number }[];
  readonly formatPrice: (price: number) => string;
}

export function TruckCardContent({
  truck,
  todayHours,
  popularItems,
  formatPrice,
}: TruckCardContentProps) {
  return (
    <>
      {truck.description && (
        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{truck.description}</p>
      )}
      <div className="space-y-4">
        {/* Ratings & Hours Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RatingSection averageRating={truck.average_rating} reviewCount={truck.review_count} />
          <OperatingHoursSection todayHours={todayHours} formatHours={formatHours} />
        </div>

        {/* Menu & Contact Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MenuSection popularItems={popularItems} formatPrice={formatPrice} />
          <ContactSection contactInfo={truck.contact_info} verificationStatus={truck.verification_status} />
        </div>

        <SocialMediaSection socialMedia={truck.social_media} />
      </div>
      {truck.verification_status && (
        <div className="mt-2">
          <Badge variant={truck.verification_status === 'verified' ? 'default' : 'secondary'}>
            <span className="capitalize">{truck.verification_status}</span>
          </Badge>
        </div>
      )}
    </>
  );
}
