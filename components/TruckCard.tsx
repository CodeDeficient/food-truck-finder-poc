'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Phone, ExternalLink, Star } from 'lucide-react';

interface FoodTruck {
  id: string;
  name: string;
  description: string;
  current_location?: {
    address: string;
  };
  operating_hours?: Record<string, { open: string; close: string; closed: boolean }>;
  contact_info?: {
    phone?: string;
    website?: string;
  };
  data_quality_score: number;
  verification_status: string;
  menu?: Array<{
    category: string;
    items: Array<{ name: string; price: number }>;
  }>;
}

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
  const getPopularItems = () => {
    if (!truck.menu || truck.menu.length === 0) return [];
    return truck.menu[0]?.items?.slice(0, 3) || [];
  };

  // Helper to determine price range fallback
  const getPriceRange = () => {
    // Flatten all prices from all menu items
    const prices = (truck.menu || [])
      .flatMap((cat) => cat.items)
      .map((item) => (typeof item.price === 'number' ? item.price : undefined))
      .filter((p): p is number => p !== undefined && !Number.isNaN(p));
    if (prices.length === 0) return;
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (max < 10) return '$';
    if (min >= 10 && max <= 20) return '$$';
    if (min > 20) return '$$$';
    if (min < 10 && max > 20) return '$-$$$';
    if (min < 10 && max <= 20) return '$-$$';
    if (min >= 10 && max > 20) return '$$-$$$';
    return '$';
  };

  const popularItems = getPopularItems();
  const priceRange = getPriceRange();

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
              {truck.current_location?.address && (
                <CardDescription className="flex items-center mt-1 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  {truck.current_location.address}
                </CardDescription>
              )}
            </div>
            <div className="flex flex-col items-end space-y-1">
              <Badge variant={isOpen ? 'default' : 'secondary'}>{isOpen ? 'Open' : 'Closed'}</Badge>
              {/* Show price range fallback if no explicit prices */}
              {popularItems.every((item) => !item.price) && priceRange && (
                <Badge variant="outline" className="mt-1">
                  {priceRange}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className={hideHeader ? 'pt-0' : ''}>
        {truck.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{truck.description}</p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Popular Items</h4>
            <div className="space-y-1">
              {popularItems.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm dark:text-gray-300">
                  <span className="truncate dark:text-gray-200">{item.name}</span>
                  {typeof item.price === 'number' && item.price > 0 && (
                    <span className="text-green-600 dark:text-green-400 ml-2">
                      {formatPrice(item.price)}
                    </span>
                  )}
                </div>
              ))}
              {popularItems.length === 0 && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">Menu not available</p>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Contact</h4>
            <div className="space-y-1 dark:text-gray-300">
              {truck.contact_info?.phone && (
                <div className="flex items-center text-sm">
                  <Phone className="h-3 w-3 mr-1" />
                  <span className="truncate">{truck.contact_info.phone}</span>
                </div>
              )}
              {truck.contact_info?.website && (
                <div className="flex items-center text-sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  <span className="truncate">Website</span>
                </div>
              )}
              {truck.verification_status && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  <Star className="h-3 w-3 mr-1" />
                  <span className="capitalize">{truck.verification_status}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        {truck.verification_status && (
          <div className="mt-2">
            <Badge variant={truck.verification_status === 'verified' ? 'default' : 'secondary'}>
              <span className="capitalize">{truck.verification_status}</span>
            </Badge>
          </div>
        )}
      </CardContent>
      {truck.verification_status === 'verified' && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <Button className="w-full" variant="default" disabled>
            Book Me
          </Button>
        </div>
      )}
    </Card>
  );
}
