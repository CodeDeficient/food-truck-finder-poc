'use client';

import { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { Search, Navigation, Moon, Sun } from 'lucide-react';
import { useThemeSwitcher } from '@/components/ThemeProvider';
import dynamic from 'next/dynamic';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { TruckCard } from '@/components/TruckCard';
import { Badge } from '@/components/ui/badge';

const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

const MapDisplay = dynamic(() => import('@/components/MapDisplay'), {
  ssr: false,
  loading: () => (
    <div className="h-96 flex items-center justify-center bg-gray-100 dark:bg-slate-800 rounded-lg">
      <p>Loading map...</p>
    </div>
  ),
});

interface FoodTruck {
  id: string;
  name: string;
  description: string;
  current_location: {
    lat: number;
    lng: number;
    address: string;
    timestamp: string;
  };
  operating_hours: Record<string, { open: string; close: string; closed: boolean }>;
  menu: Array<{
    category: string;
    items: Array<{
      name: string;
      description: string;
      price: number;
      dietary_tags: string[];
    }>;
  }>;
  contact_info: {
    phone?: string;
    email?: string;
    website?: string;
  };
  social_media: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
  };
  data_quality_score: number;
  verification_status: string;
  distance?: number;
}

interface TrucksApiResponse {
  trucks: FoodTruck[];
  // Add other properties if your API returns more, e.g., total, page, etc.
}

export default function FoodTruckFinder() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [selectedTruckId, setSelectedTruckId] = useState<string | undefined>();

  const { setTheme, resolvedTheme } = useThemeSwitcher();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    void loadFoodTrucks();
    getUserLocation();
  }, []);
  const getUserLocation = () => {
    if (navigator.geolocation) {
      // eslint-disable-next-line sonarjs/no-intrusive-permissions -- Geolocation is essential for finding nearby food trucks
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn('Location access denied:', error);
          // Default to San Francisco
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        },
      );
    } else {
      // Default to San Francisco
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  };

  const loadFoodTrucks = async () => {
    try {
      const response = await fetch('/api/trucks');
      const data: TrucksApiResponse = (await response.json()) as TrucksApiResponse;
      setTrucks(data.trucks || []);
    } catch (error) {
      console.error('Failed to load food trucks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadNearbyTrucks = async () => {
    if (!userLocation) return;

    try {
      const response = await fetch(
        `/api/trucks?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=10`,
      );
      const data: TrucksApiResponse = (await response.json()) as TrucksApiResponse;
      setTrucks(data.trucks || []);
    } catch (error) {
      console.error('Failed to load nearby trucks:', error);
    }
  };

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      truck.description?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const isOpen = (truck: FoodTruck) => {
    const today = getCurrentDay();
    const hours = truck.operating_hours?.[today];

    // Ensure hours and its properties are not null/undefined before accessing
    if (!hours || hours.closed || !hours.open || !hours.close) {
      return false;
    }

    try {
      const now = new Date();
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const openTime = Number.parseInt(hours.open.replace(':', ''));
      const closeTime = Number.parseInt(hours.close.replace(':', ''));

      return currentTime >= openTime && currentTime <= closeTime;
    } catch (error) {
      console.error('Error parsing operating hours for truck', truck.name, error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Finding delicious food trucks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                🚚 Food Truck Finder
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Discover amazing food trucks near you
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:space-x-4">
              {' '}
              {/* Added flex-wrap, justify-end, gap-2. Removed space-x-4 for sm screens */}
              <div className="flex items-center space-x-2 order-1 sm:order-none">
                {' '}
                {/* Control order for small screens if needed */}
                {mounted &&
                  (resolvedTheme === 'dark' ? (
                    <Sun className="h-5 w-5 text-yellow-400" />
                  ) : (
                    <Moon className="h-5 w-5 text-slate-500" />
                  ))}
                <Switch
                  id="theme-switcher"
                  checked={mounted && resolvedTheme === 'dark'}
                  onCheckedChange={(checked: boolean) => {
                    setTheme(checked ? 'dark' : 'light');
                  }}
                  aria-label="Switch between dark and light mode"
                  disabled={!mounted}
                />
                <Label
                  htmlFor="theme-switcher"
                  className="hidden sm:block text-sm text-gray-700 dark:text-gray-300"
                >
                  {mounted && (resolvedTheme === 'dark' ? 'Light Mode' : 'Dark Mode')}
                </Label>
              </div>
              <div className="relative order-3 sm:order-none w-full sm:w-64">
                {' '}
                {/* Full width on small, fixed on sm+ */}
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
                <Input
                  placeholder="Search food trucks..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchTerm(e.target.value)
                  }
                  className="pl-10 w-full bg-white dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400" // w-full for responsiveness
                />
              </div>
              <Button
                onClick={() => {
                  void loadNearbyTrucks();
                }}
                disabled={!userLocation}
                variant="outline"
                className="order-2 sm:order-none"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Find Nearby
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real Map */}
            <div
              key="map-container-parent"
              className="lg:col-span-2 h-80 min-h-[320px] sm:h-96 sm:min-h-[400px] dark:bg-slate-800 rounded-lg shadow"
            >
              <MapDisplay
                trucks={filteredTrucks}
                userLocation={userLocation}
                onSelectTruck={setSelectedTruckId}
                defaultCenter={
                  userLocation ? [userLocation.lat, userLocation.lng] : [37.7749, -122.4194]
                } // Provide a stable default
                selectedTruckLocation={
                  selectedTruckId
                    ? (() => {
                        const truck = filteredTrucks.find((t) => t.id === selectedTruckId);
                        return truck?.current_location?.lat && truck?.current_location?.lng
                          ? [truck.current_location.lat, truck.current_location.lng]
                          : undefined; // Changed from null to undefined
                      })()
                    : undefined
                }
              />
            </div>

            {/* Combined Truck List and Details */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold dark:text-gray-100">
                Nearby Trucks ({filteredTrucks.length})
              </h3>
              <Accordion
                type="single"
                collapsible
                className="w-full"
                value={selectedTruckId || undefined}
                onValueChange={(value: string | undefined) =>
                  setSelectedTruckId((currentId) => (value === currentId ? undefined : value))
                }
              >
                {filteredTrucks.map((truck) => (
                  <AccordionItem value={truck.id} key={truck.id}>
                    <AccordionTrigger className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-md">
                      <div className="flex-1 text-left">
                        <h4 className="font-medium dark:text-gray-100">{truck.name}</h4>
                        {truck.current_location?.address && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {truck.current_location.address}
                          </p>
                        )}
                      </div>
                      <Badge variant={isOpen(truck) ? 'default' : 'secondary'}>
                        {isOpen(truck) ? 'Open' : 'Closed'}
                      </Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <TruckCard
                        truck={truck}
                        isOpen={isOpen(truck)}
                        onSelectTruck={() => setSelectedTruckId(truck.id)}
                        userLocation={userLocation}
                        formatPrice={formatPrice}
                        hideHeader={true}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
