'use client';

import { useState, useEffect } from 'react';
import { useThemeSwitcher } from '@/components/ThemeProvider';
import { isTruckOpen } from '@/lib/utils/foodTruckHelpers';
import { AppHeader } from '@/components/home/AppHeader';
import { MainContent } from '@/components/home/MainContent';
import { LoadingScreen } from '@/components/home/LoadingScreen';
import { useFoodTruckFinder } from '@/hooks/useFoodTruckFinder';

export default function FoodTruckFinder() {
  const {
    loading,
    searchTerm,
    setSearchTerm,
    userLocation,
    loadNearbyTrucks,
    filteredTrucks,
    selectedTruckId,
    setSelectedTruckId,
  } = useFoodTruckFinder();

  const { setTheme, resolvedTheme } = useThemeSwitcher();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
