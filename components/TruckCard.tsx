'use client';

import { Card, CardContent, CardHeader, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { FoodTruck } from '@/lib/types';
import { useTruckCard } from '@/hooks/useTruckCard';
import { formatPrice } from '@/lib/utils/foodTruckHelpers';
import { Eye, MapPin, Heart } from 'lucide-react';
import { MenuSection } from '@/components/ui/MenuSection';
import { SocialMediaSection } from '@/components/ui/SocialMediaSection';
import { ContactSection } from '@/components/ui/ContactSection';
import { TruckDetailsModal } from '@/components/TruckDetailsModal';
import { useState } from 'react';

interface TruckCardProps {
  readonly truck: FoodTruck;
  readonly isOpen: boolean;
  readonly onSelectTruck: () => void;
  readonly userLocation?: { lat: number; lng: number };
  readonly hideHeader?: boolean;
  readonly isFavorite?: boolean;
  readonly onToggleFavorite?: () => void;
}

export function TruckCard({ truck, isOpen, onSelectTruck, hideHeader = false, isFavorite = false, onToggleFavorite }: TruckCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Defensive checks for required data
  if (!truck?.id) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700">
        <CardContent className="p-4">
          <p className="text-muted-foreground">Invalid truck data</p>
        </CardContent>
      </Card>
    );
  }
  
  const { popularItems, priceRange, todayHours } = useTruckCard(truck);
  const {
    name = 'Unnamed Truck',
    social_media = {},
    contact_info = {},
  } = truck;
  
  // Safely extract contact info with fallbacks
  const { phone = '', email = '', website = '' } = contact_info ?? {};

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleFavorite) {
      onToggleFavorite();
    }
  };

  return (
    <Card
      className={`hover:shadow-md transition-shadow cursor-pointer dark:bg-slate-800 dark:border-slate-700 ${hideHeader ? 'shadow-none border-none bg-transparent dark:bg-transparent' : ''}`}
      onClick={onSelectTruck}
    >
      {!hideHeader && (
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-lg dark:text-gray-100">{truck.name}</CardTitle>
              {truck.current_location?.address != undefined && (
                <CardDescription className="flex items-center mt-1 dark:text-gray-400">
                  <MapPin className="size-4 mr-1" />
                  {truck.current_location.address}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col items-end space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={isOpen ? 'open' : 'secondary'}>{isOpen ? 'Open' : 'Closed'}</Badge>
                {onToggleFavorite && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`hover:scale-110 transition-all duration-200 ${isFavorite ? 'neon-text' : 'hover-neon'}`}
                    onClick={handleToggleFavorite}
                    aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                  >
                    <Heart className={`size-4 ${isFavorite ? 'fill-current' : ''}`} />
                  </Button>
                )}
              </div>
              {/* Show price range fallback if no explicit prices */}
              {popularItems.every((item) => item.price === undefined) &&
                priceRange !== undefined &&
                priceRange !== '' && (
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
          {name && (
            <>
              {todayHours !== undefined && (todayHours.closed === false) && (
                <div className="hours-display">
                  <strong>Today:</strong> {todayHours.open} - {todayHours.close}
                </div>
              )}
            </>
          )}

          {popularItems.length > 0 && (
            <MenuSection
              items={popularItems.map(item => ({
                name: item.name,
                price: formatPrice(item.price ?? 0),
              }))}
            />
          )}

          {Object.keys(social_media).length > 0 && (typeof social_media === 'object')&& (
            <SocialMediaSection socialMedia={social_media} />
          )}

          {(phone || email || website) && (
            <ContactSection contactInfo={{ phone, website }} />
          )}
        </main>
      </CardContent>
      <CardFooter>
        <div className="flex gap-2 w-full">
          <Button 
            className="flex-1" 
            variant="neon" 
            onClick={handleViewDetails}
          >
            <Eye className="size-4 mr-2" />
            View Details
          </Button>
          {truck.verification_status === 'verified' && (
            <Button className="flex-1" variant="default" disabled>
              Book Me
            </Button>
          )}
        </div>
      </CardFooter>
      
      <TruckDetailsModal
        truck={truck}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isTruckOpen={isOpen}
      />
    </Card>
  );
}
