'use client';

import { useState, useEffect } from 'react';
import { useThemeSwitcher } from '@/components/ThemeProvider';
import { isTruckOpen } from '@/lib/utils/foodTruckHelpers';
import { AppHeader } from '@/components/home/AppHeader';
import { MainContent } from '@/components/home/MainContent';
import { LoadingScreen } from '@/components/home/LoadingScreen';
import { useFoodTruckFinder } from '@/hooks/useFoodTruckFinder';

/**
* FoodTruckFinder is a React component that connects the UI components needed to search and display nearby food trucks.
* @example
* <FoodTruckFinder />
* Renders a component that allows users to find food trucks based on their location.
* @param None
* @returns {JSX.Element} Returns the layout including the header and main content for the food truck finder application.
* @description
*   - Utilizes custom hooks `useFoodTruckFinder` and `useThemeSwitcher` for state management and theme switching.
*   - It initiates a loading state screen while fetching data asynchronously.
*   - Components inside include `AppHeader` and `MainContent` for interacting with the application.
*   - The component supports theme switching between light and dark modes using `setTheme` and `resolvedTheme`.
*/
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
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <AppHeader
        mounted={mounted}
        resolvedTheme={resolvedTheme}
        setTheme={setTheme}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        userLocation={userLocation}
        loadNearbyTrucks={() => {
          void loadNearbyTrucks();
        }}
      />

      <MainContent
        filteredTrucks={filteredTrucks}
        userLocation={userLocation}
        selectedTruckId={selectedTruckId}
        setSelectedTruckId={setSelectedTruckId}
        isOpen={isTruckOpen}
        theme={resolvedTheme}
      />
    </div>
  );
}

// No 'any' usage found in this file. All hooks and props are typed. If any dynamic values are used in MainContent or AppHeader, ensure their types are correct in their respective files.
