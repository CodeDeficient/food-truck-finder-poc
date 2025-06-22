'use client';

import { useState, useEffect } from 'react';

import { useThemeSwitcher } from '@/components/ThemeProvider';
import { FoodTruck, TrucksApiResponse } from '@/lib/types/foodTruck';
import {
  getUserLocationHelper,
  loadFoodTrucksHelper,
  loadNearbyTrucksHelper,
  isTruckOpen,
} from '@/lib/utils/foodTruckHelpers';
import { AppHeader } from '@/components/home/AppHeader';
import { MainContent } from '@/components/home/MainContent';
import { LoadingScreen } from '@/components/home/LoadingScreen';

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
    void loadFoodTrucksHelper(setTrucks, setLoading);
    getUserLocationHelper(setUserLocation);
  }, []);

  const loadNearbyTrucks = async () => {
    await loadNearbyTrucksHelper(userLocation, setTrucks);
  };

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (truck.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <AppHeader
        mounted={mounted}
        resolvedTheme={resolvedTheme}
        setTheme={setTheme}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        userLocation={userLocation}
        loadNearbyTrucks={loadNearbyTrucks}
      />

      <MainContent
        filteredTrucks={filteredTrucks}
        userLocation={userLocation}
        selectedTruckId={selectedTruckId}
        setSelectedTruckId={setSelectedTruckId}
        isOpen={isTruckOpen}
      />
    </div>
  );
}
