'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FoodTruck } from '@/lib/types/foodTruck';
import {
  getPopularItems,
  getPriceRange,
  getTodayHours,
  formatHours,
} from '@/lib/utils/foodTruckHelpers';
import { RatingSection } from './trucks/RatingSection';
import { MenuSection } from './trucks/MenuSection';
import { ContactSection } from './trucks/ContactSection';
import { SocialMediaSection } from './trucks/SocialMediaSection';
import { TruckCardHeader } from './trucks/TruckCardHeader';
import { OperatingHoursSection } from './trucks/OperatingHoursSection';
import { TruckCardFooter } from './trucks/TruckCardFooter';

interface TruckCardProps {
  readonly truck: FoodTruck;
  readonly isOpen: boolean;
  readonly onSelectTruck: () => void;
  readonly formatPrice: (price: number) => string;
  readonly userLocation?: { lat: number; lng: number };
  readonly hideHeader?: boolean; // Add option to hide header when used in accordion
}

export function TruckCard({
  truck,
  isOpen,
  onSelectTruck,
  formatPrice,
  hideHeader = false,
}: TruckCardProps) {
  const popularItems = getPopularItems(truck);
  const priceRange = getPriceRange(truck);
  const todayHours = getTodayHours(truck);

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700 ${hideHeader ? 'shadow-none border-none bg-transparent dark:bg-transparent' : ''}`}
      onClick={onSelectTruck}
    >
      {!hideHeader && (
        <TruckCardHeader
          truck={truck}
          isOpen={isOpen}
          popularItems={popularItems}
          priceRange={priceRange}
        />
      )}
      <CardContent className={hideHeader ? 'pt-0' : ''}>
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
      </CardContent>
      <TruckCardFooter truck={truck} />
    </Card>
  );
}
