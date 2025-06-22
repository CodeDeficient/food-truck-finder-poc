import { useState, useEffect } from 'react';
import { FoodTruck } from '@/lib/types/foodTruck';
import {
  getUserLocationHelper,
  loadFoodTrucksHelper,
  loadNearbyTrucksHelper,
} from '@/lib/utils/foodTruckHelpers';

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
