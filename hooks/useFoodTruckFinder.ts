import { useState, useEffect } from 'react';
import type { FoodTruck } from '@/lib/types';
import {
  getUserLocationHelper,
  loadFoodTrucksHelper,
  loadNearbyTrucksHelper,
} from '@/lib/utils/foodTruckHelpers';

/**
* Custom hook to load and filter food truck data based on user location and search term.
* @example
* const { trucks, loadNearbyTrucks } = useFoodTruckFinder();
* // Outputs a list of nearby food trucks
* @param {void} - This hook does not take any arguments.
* @returns {Object} An object with food truck data and utility methods.
* @description
*   - Initializes food truck data and loading states upon mounting.
*   - Retrieves user's location to filter nearby food trucks.
*   - Filters trucks by name and description based on the search term.
*/
export const useFoodTruckFinder = () => {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [selectedTruckId, setSelectedTruckId] = useState<string | undefined>();

  useEffect(() => {
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

  return {
    trucks,
    loading,
    searchTerm,
    setSearchTerm,
    userLocation,
    selectedTruckId,
    setSelectedTruckId,
    loadNearbyTrucks,
    filteredTrucks,
  };
};
