'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Phone, Search, Navigation, Moon, Sun } from 'lucide-react';
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

// --- Dashboard Data Types ---
interface RecentTruckContact {
  // More specific type for contact
  phone?: string;
  email?: string;
  website?: string;
}

interface RecentTruckOperatingHours {
  // More specific type for operating_hours
  // Assuming a simple structure for overview, adjust if more detail is needed
  [day: string]: { open?: string; close?: string; closed?: boolean } | string | undefined;
}

interface RecentTruckMenuSummary {
  // More specific type for menu
  // Assuming a summary structure, e.g., number of categories or top items
  categoriesCount?: number;
  topItems?: string[];
}

interface RecentTruck {
  id: string;
  name: string;
  location: { address: string };
  operating_hours: RecentTruckOperatingHours | Record<string, unknown>; // Allow some flexibility or use a more defined type
  menu: RecentTruckMenuSummary | Record<string, unknown>; // Allow some flexibility
  contact: RecentTruckContact | Record<string, unknown>; // Allow some flexibility
  last_updated: string;
  data_quality_score: number;
}

interface DashboardOverview {
  totalTrucks: number;
  recentTrucks: Array<RecentTruck>;
  averageQuality: number;
  verifiedTrucks: number;
  pendingTrucks: number;
  lastUpdated: string;
}

interface RecentJob {
  // Define a more specific type for recentJobs
  id: string; // Assuming job has an ID
  job_type: string;
  status: string;
  completed_at?: string; // Or created_at, depending on what's relevant
  target_url?: string;
}

interface DashboardScraping {
  pending: number;
  running: number;
  completedToday: number;
  failedToday: number;
  recentJobs: Array<RecentJob>;
  successRate: number;
}

interface DashboardQuality {
  avg_quality_score: number;
  verified_count: number;
  pending_count: number;
  flagged_count: number;
  // Index signature removed to avoid no-explicit-any issues with it.
  // If other dynamic numeric properties are needed, they should be handled explicitly
  // or this type needs further refinement.
}

interface DashboardUsage {
  gemini: {
    requests: { used: number; limit: number; percentage: number };
    tokens: { used: number; limit: number; percentage: number };
  };
}

interface DashboardData {
  overview?: DashboardOverview;
  scraping?: DashboardScraping;
  quality?: DashboardQuality; // Removed Omit, as index signature is gone
  usage?: DashboardUsage;
}

export default function FoodTruckFinder() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [selectedTruckId, setSelectedTruckId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('map');
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
        <Card className="mb-6 dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold dark:text-gray-100">
              Current Target Food Truck Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 dark:text-gray-300">
              The primary data source for food truck information is currently:
            </p>
            <a
              href="https://eatrotirolls.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline dark:text-blue-400"
            >
              https://eatrotirolls.com/
            </a>
          </CardContent>
        </Card>

        <Tabs
          value={activeTab}
          onValueChange={(value: string) => setActiveTab(value)}
          className="space-y-6"
        >
          <TabsList>
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
            <TabsTrigger value="admin">Admin Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-6">
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
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                            {truck.current_location?.address || 'Location not available'}
                          </p>
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
                        />
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="list" className="space-y-6">
            <div className="grid gap-6">
              {filteredTrucks.map((truck) => (
                <Card key={truck.id} className="dark:bg-slate-800 dark:border-slate-700">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg dark:text-gray-100">{truck.name}</CardTitle>
                        <CardDescription className="flex items-center mt-1 dark:text-gray-400">
                          <MapPin className="h-4 w-4 mr-1" />
                          {truck.current_location?.address || 'Location not available'}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={isOpen(truck) ? 'default' : 'secondary'}>
                          {isOpen(truck) ? 'Open' : 'Closed'}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="dark:text-gray-300 dark:border-slate-600"
                        >
                          {Math.round(truck.data_quality_score * 100)}% Quality
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{truck.description}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2 dark:text-gray-100">Popular Items</h4>
                        <div className="space-y-1 dark:text-gray-300">
                          {truck.menu?.slice(0, 1).map((category) =>
                            category.items?.slice(0, 3).map((item, idx) => (
                              <div key={idx} className="flex justify-between text-sm">
                                <span className="dark:text-gray-200">{item.name}</span>
                                <span className="text-green-600 dark:text-green-400">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                            )),
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2 dark:text-gray-100">Today's Hours</h4>
                        <div className="text-sm dark:text-gray-300">
                          {(() => {
                            const today = getCurrentDay();
                            const hours = truck.operating_hours?.[today];
                            return hours?.closed
                              ? 'Closed today'
                              : `${hours?.open} - ${hours?.close}`;
                          })()}
                        </div>
                        {truck.contact_info?.phone && (
                          <div className="flex items-center mt-2 text-sm dark:text-gray-300">
                            <Phone className="h-4 w-4 mr-1" />
                            {truck.contact_info.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="admin">
            <AdminDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | undefined>();
  const [loadingAdmin, setLoadingAdmin] = useState(true); // Renamed to avoid conflict
  const { resolvedTheme: adminTheme } = useThemeSwitcher(); // Use resolvedTheme for admin section too
  const [adminMounted, setAdminMounted] = useState(false);

  useEffect(() => {
    setAdminMounted(true);
    void loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard');
      const data = (await response.json()) as DashboardData;
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoadingAdmin(false);
    }
  };

  if (loadingAdmin) {
    return (
      <div
        className={`text-center py-8 ${adminMounted && adminTheme === 'dark' ? 'text-gray-300' : ''}`}
      >
        Loading admin dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-300">Total Trucks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">
              {dashboardData?.overview?.totalTrucks || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-300">Active Scrapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">
              {dashboardData?.scraping?.running || 0}
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-300">Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">
              {(dashboardData?.scraping?.successRate || 0).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium dark:text-gray-300">Data Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold dark:text-gray-100">
              {((dashboardData?.quality?.avg_quality_score || 0) * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">API Usage Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                  <span>Gemini Requests</span>
                  <span>
                    {dashboardData?.usage?.gemini?.requests?.used || 0} /
                    {dashboardData?.usage?.gemini?.requests?.limit || 1500}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                    style={{ width: `${dashboardData?.usage?.gemini?.requests?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                  <span>Gemini Tokens</span>
                  <span>
                    {dashboardData?.usage?.gemini?.tokens?.used || 0} /
                    {dashboardData?.usage?.gemini?.tokens?.limit || 32_000}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                    style={{ width: `${dashboardData?.usage?.gemini?.tokens?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                  <span>Gemini Requests</span>
                  <span>
                    {dashboardData?.usage?.gemini?.requests?.used || 0} /
                    {dashboardData?.usage?.gemini?.requests?.limit || 1500}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full"
                    style={{ width: `${dashboardData?.usage?.gemini?.requests?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1 dark:text-gray-300">
                  <span>Gemini Tokens</span>
                  <span>
                    {dashboardData?.usage?.gemini?.tokens?.used || 0} /
                    {dashboardData?.usage?.gemini?.tokens?.limit || 32_000}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                    style={{ width: `${dashboardData?.usage?.gemini?.tokens?.percentage || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-slate-800 dark:border-slate-700">
          <CardHeader>
            <CardTitle className="dark:text-gray-100">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData?.scraping?.recentJobs
                ?.slice(0, 5)
                .map((job: RecentJob, idx: number) => (
                  <div key={job.id || idx} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium dark:text-gray-200">
                        {job.job_type || 'Scraping job'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {job.completed_at
                          ? new Date(job.completed_at).toLocaleString()
                          : 'Recently'}
                      </p>
                    </div>
                    <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
                      {job.status}
                    </Badge>
                  </div>
                )) || (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent activity
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
