'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MapPin } from 'lucide-react';
import Link from 'next/link';
import { FoodTruck } from '@/lib/types';
import { useTruckCard } from '@/hooks/useTruckCard';
import { formatPrice } from '@/lib/utils/foodTruckHelpers';
import { MenuSection } from '@/components/ui/MenuSection';
import { SocialMediaSection } from '@/components/ui/SocialMediaSection';
import { ContactSection } from '@/components/ui/ContactSection';

interface TruckCardProps {
  readonly truck: FoodTruck;
  readonly isOpen: boolean;
  readonly onSelectTruck: () => void;
  readonly userLocation?: { lat: number; lng: number };
  readonly hideHeader?: boolean;
}

export function TruckCard({ truck, isOpen, onSelectTruck, hideHeader = false }: TruckCardProps) {
  const { popularItems, priceRange, todayHours } = useTruckCard(truck);

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700 ${
        hideHeader ? 'shadow-none border-none bg-transparent dark:bg-transparent' : ''
      }`}
      onClick={onSelectTruck}
    >
      {!hideHeader && (
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg dark:text-gray-100">{truck.name}</CardTitle>
              {truck.current_location?.address && (
                <CardDescription className="flex items-center mt-1 dark:text-gray-400">
                  <MapPin className="size-4 mr-1" />
                  {truck.current_location.address}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge variant={isOpen ? 'default' : 'secondary'}>{isOpen ? 'Open' : 'Closed'}</Badge>
              {popularItems.every((item) => item.price === undefined) && !!priceRange && (
                <Badge variant="outline" className="mt-1">
                  {priceRange}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={hideHeader ? 'pt-0' : ''}>
        <main className="ui-truck-container">
          {!!truck.name && (
            <>
              {todayHours && todayHours.closed === false && (
                <div className="hours-display">
                  <strong>Today:</strong> {todayHours.open} - {todayHours.close}
                </div>
              )}
            </>
          )}

          {popularItems.length > 0 && (
            <MenuSection
              items={popularItems.map((item) => ({
                name: item.name,
                price: formatPrice(item.price ?? 0),
              }))}
            />
          )}

          {!!truck.social_media && Object.keys(truck.social_media).length > 0 && (
            <SocialMediaSection social_media={truck.social_media} />
          )}

          {!!truck.contact_info && (truck.contact_info.phone ?? truck.contact_info.email ?? truck.contact_info.website) && (
            <ContactSection
              phone_number={truck.contact_info.phone}
              email={truck.contact_info.email}
              website={truck.contact_info.website}
            />
          )}
        </main>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2">
          <Button asChild className="flex-1" variant="outline">
            <Link href={`/trucks/${truck.id}`}>
              <Eye className="size-4 mr-2" />
              View Details
            </Link>
          </Button>
          {truck.verification_status === 'verified' && (
            <Button className="flex-1" variant="default" disabled>
              Book Me
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
