'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FoodTruck } from '@/lib/types/foodTruck';
import { useTruckCard } from '@/hooks/useTruckCard';
import { TruckCardHeader } from './trucks/TruckCardHeader';
import { TruckCardContent } from './trucks/TruckCardContent';
import { TruckCardFooter } from './trucks/TruckCardFooter';
import { formatPrice } from '@/lib/utils/foodTruckHelpers';

interface TruckCardProps {
  readonly truck: FoodTruck;
  readonly isOpen: boolean;
  readonly onSelectTruck: () => void;
  readonly formatPrice: (price: number) => string;
  readonly userLocation?: { lat: number; lng: number };
  readonly hideHeader?: boolean;
}

export function TruckCard({
  truck,
  isOpen,
  onSelectTruck,
  formatPrice,
  hideHeader = false,
}: TruckCardProps) {
  const { popularItems, priceRange, todayHours } = useTruckCard(truck);

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
        <TruckCardContent
          truck={truck}
          todayHours={todayHours}
          popularItems={popularItems}
          formatPrice={formatPrice}
        />
      </CardContent>
      <TruckCardFooter truck={truck} />
    </Card>
  );
}
