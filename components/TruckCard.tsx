'use client';

import { Card, CardContent } from '@/components/ui/card';
import { FoodTruck } from '@/lib/types';
import { useTruckCard } from '@/hooks/useTruckCard';
import { TruckCardHeader } from './trucks/TruckCardHeader';
import { TruckCardContent } from '@/components/ui/TruckCardContent';

import { TruckCardFooter } from './trucks/TruckCardFooter';



interface TruckCardProps {
  readonly truck: FoodTruck;
  readonly isOpen: boolean;
  readonly onSelectTruck: () => void;
  readonly userLocation?: { lat: number; lng: number };
  readonly hideHeader?: boolean;
}

/**
 * Renders a card component for displaying truck information with optional header.
 * @example
 * TruckCard({ truck: truckData, isOpen: true, onSelectTruck: handleSelect, hideHeader: false })
 * Returns a JSX element representing the truck card.
 * @param {Object} truck - The truck object containing details to be displayed on the card.
 * @param {boolean} isOpen - Indicates whether the truck is currently open or closed.
 * @param {function} onSelectTruck - Callback function to handle click events on the truck card.
 * @param {boolean} [hideHeader=false] - Optional flag to hide the card header. If true, the header will not be rendered.
 * @returns {JSX.Element} A JSX element representing the truck card, with optional header.
 * @description
 *   - Utilizes the useTruckCard hook for fetching truck-specific properties such as popular items and operating hours.
 *   - Applies conditional styling based on the hideHeader flag to manage card appearance.
 */
export function TruckCard({ truck, isOpen, onSelectTruck, hideHeader = false }: TruckCardProps) {
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
        <TruckCardContent truck={truck} todayHours={todayHours} popularItems={popularItems} />
      </CardContent>
      <TruckCardFooter truck={truck} />
    </Card>
  );
}
