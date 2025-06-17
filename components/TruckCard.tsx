'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
{/* @ts-expect-error TS(2792): Cannot find module 'lucide-react'. Did you mean to... Remove this comment to see the full error message */}
import { MapPin, Phone, Star, Clock, Globe, Eye } from 'lucide-react';
// @ts-expect-error TS(2792): Cannot find module 'next/link'. Did you mean to se... Remove this comment to see the full error message
import Link from 'next/link';

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
    email?: string;
  };
  social_media?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  average_rating?: number;
  review_count?: number;
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

// Helper to format operating hours
const formatHours = (hours: { open: string; close: string; closed: boolean }) => {
  if (hours.closed) return 'Closed';
  return `${hours.open} - ${hours.close}`;
};

// Rating section component
function RatingSection({ averageRating, reviewCount }: {
  readonly averageRating?: number;
  readonly reviewCount?: number;
}) {
  if (averageRating === undefined) return undefined;

  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Rating</h4>
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= Math.round(averageRating ?? 0)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium dark:text-gray-200">
          {averageRating.toFixed(1)}
        </span>
        {(reviewCount !== undefined) && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({reviewCount} reviews)
          </span>
        )}
      </div>
    </div>
  );
}

// Menu section component
function MenuSection({ popularItems, formatPrice }: {
  readonly popularItems: Array<{ name: string; price?: number }>;
  readonly formatPrice: (price: number) => string;
}) {
  return (
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
  );
}

// Contact section component
function ContactSection({ contactInfo, verificationStatus }: {
  readonly contactInfo?: { phone?: string; website?: string };
  readonly verificationStatus?: string;
}) {
  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Contact</h4>
      <div className="space-y-1 dark:text-gray-300">
        {(contactInfo?.phone !== undefined) && (
          <a
            href={`tel:${contactInfo.phone}`}
            className="flex items-center text-sm hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Phone className="h-3 w-3 mr-1" />
            <span className="truncate">{contactInfo.phone}</span>
          </a>
        )}
        {(contactInfo?.website !== undefined) && (
          <a
            href={contactInfo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm hover:text-blue-600 dark:hover:text-blue-400"
          >
            <Globe className="h-3 w-3 mr-1" />
            <span className="truncate">Website</span>
          </a>
        )}
        {verificationStatus && (
          <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
            <Star className="h-3 w-3 mr-1" />
            <span className="capitalize">{verificationStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Social Media section component
function SocialMediaSection({ socialMedia }: {
  readonly socialMedia?: { instagram?: string; facebook?: string; twitter?: string };
}) {
  if (!socialMedia || Object.keys(socialMedia).length === 0) return undefined;

  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Social Media</h4>
      <div className="flex flex-wrap gap-2">
        {(socialMedia.instagram !== undefined) && (
          <a
            href={`https://instagram.com/${socialMedia.instagram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-800 rounded-md text-xs hover:bg-pink-200 dark:bg-pink-900 dark:text-pink-200"
          >
            <Globe className="h-3 w-3" />
            Instagram
          </a>
        )}
        {(socialMedia.facebook !== undefined) && (
          <a
            href={`https://facebook.com/${socialMedia.facebook}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200"
          >
            <Globe className="h-3 w-3" />
            Facebook
          </a>
        )}
        {(socialMedia.twitter !== undefined) && (
          <a
            href={`https://twitter.com/${socialMedia.twitter}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2 py-1 bg-sky-100 text-sky-800 rounded-md text-xs hover:bg-sky-200 dark:bg-sky-900 dark:text-sky-200"
          >
            <Globe className="h-3 w-3" />
            Twitter
          </a>
        )}
      </div>
    </div>
  );
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
    return truck.menu[0]?.items?.slice(0, 3) ?? [];
  };

  // Helper to determine price range fallback
  const getPriceRange = () => {
    // Flatten all prices from all menu items
    const prices = (truck.menu ?? [])
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

  // Helper to get today's operating hours
  const getTodayHours = () => {
    if (!truck.operating_hours) return;
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayKey = days[new Date().getDay()];
    return truck.operating_hours[todayKey];
  };

  const popularItems = getPopularItems();
  const priceRange = getPriceRange();
  const todayHours = getTodayHours();

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
              {(truck.current_location?.address !== undefined) && (
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
        <div className="space-y-4">
          {/* Ratings & Hours Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RatingSection averageRating={truck.average_rating} reviewCount={truck.review_count} />

            {/* Operating Hours */}
            {todayHours && (
              <div>
                <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Today's Hours</h4>
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3 text-gray-500" />
                  <span className="text-sm dark:text-gray-300">
                    {formatHours(todayHours)}
                  </span>
                </div>
              </div>
            )}
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
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex gap-2">
          {/* @ts-expect-error TS(2322): Type '{ children: Element; asChild: true; classNam... Remove this comment to see the full error message */}
          <Button asChild className="flex-1" variant="outline">
            <Link href={`/trucks/${truck.id}`}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </Link>
          </Button>
          {truck.verification_status === 'verified' && (
            <Button className="flex-1" variant="default" disabled>
              Book Me
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
