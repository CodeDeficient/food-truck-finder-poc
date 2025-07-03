import { FoodTruck, DailyOperatingHours, MenuItem } from '@/lib/types'; // Added DailyOperatingHours, PriceRange, MenuItem

export const getCurrentDay = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
};

export const formatPrice = (price: number | string) => {
  // Updated to accept string
  if (typeof price === 'string') {
    // Handle cases where price might be a string like "$10-$20" or "Varies"
    return price;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export const formatHours = (hours: DailyOperatingHours) => {
  // Updated to accept DailyOperatingHours
  if (!hours || hours.closed) {
    return 'Closed';
  }
  const open = new Date(`1970-01-01T${hours.open}Z`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  const close = new Date(`1970-01-01T${hours.close}Z`).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
  return `${open} - ${close}`;
};

export const getPopularItems = (truck: FoodTruck): MenuItem[] => {
  // Explicitly define return type
  // Explicitly check for nullish and boolean
  return (
    truck.menu
      ?.flatMap((category) => category.items)
      .filter((item): item is MenuItem => Boolean(item && item.is_popular === true)) ?? []
  );
};

export const getPriceRange = (truck: FoodTruck) => {
  const allItems = truck.menu?.flatMap((category) => category.items);
  if (!allItems || allItems.length === 0) {
    return 'N/A';
  }
  const numericPrices = allItems
    .map((item) => item.price)
    .filter((price): price is number => typeof price === 'number' && price != undefined); // Filter for numbers

  if (numericPrices.length === 0) {
    return 'N/A'; // No numeric prices found
  }

  const minPrice = Math.min(...numericPrices);
  const maxPrice = Math.max(...numericPrices);
  return `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
};

export const getTodayHours = (truck: FoodTruck) => {
  const today = getCurrentDay();
  return truck.operating_hours?.[today];
};

// Get user's current location or default to San Francisco
export function getUserLocationHelper(
  setUserLocation: (location: { lat: number; lng: number }) => void,
) {
  if (typeof navigator !== 'undefined' && navigator.geolocation != undefined) {
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
    // Default to San Francisco if geolocation is not supported
    setUserLocation({ lat: 37.7749, lng: -122.4194 });
  }
}

// Load all food trucks from API
export async function loadFoodTrucksHelper(
  setTrucks: (trucks: FoodTruck[]) => void,
  setLoading: (loading: boolean) => void,
) {
  try {
    const response = await fetch('/api/trucks');
    const data: unknown = await response.json();
    if (
      typeof data === 'object' &&
      data != undefined &&
      'trucks' in data &&
      Array.isArray(data.trucks)
    ) {
      setTrucks(data.trucks as FoodTruck[]);
    } else {
      setTrucks([]);
    }
  } catch (error: unknown) {
    console.error('Failed to load food trucks:', error);
  } finally {
    setLoading(false);
  }
}

// Load nearby food trucks based on user location
export async function loadNearbyTrucksHelper(
  userLocation: { lat: number; lng: number } | undefined,
  setTrucks: (trucks: FoodTruck[]) => void,
) {
  if (!userLocation) return;

  try {
    const response = await fetch(
      `/api/trucks?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=10`,
    );
    const data: unknown = await response.json();
    if (
      typeof data === 'object' &&
      data != undefined &&
      'trucks' in data &&
      Array.isArray(data.trucks)
    ) {
      setTrucks(data.trucks as FoodTruck[]);
    } else {
      setTrucks([]);
    }
  } catch (error: unknown) {
    console.error('Failed to load nearby trucks:', error);
  }
}

// Check if a food truck is currently open
export function isTruckOpen(truck: FoodTruck): boolean {
  const today = getCurrentDay();
  const hours = truck.operating_hours?.[today];

  // Ensure hours and its properties are not null/undefined before accessing
  if (
    hours == undefined ||
    hours.closed === true ||
    hours.open == undefined ||
    hours.close == undefined
  ) {
    return false;
  }

  try {
    const now = new Date();
    const currentTime = now.getHours() * 100 + now.getMinutes();
    const openTime = Number.parseInt(hours.open.replace(':', ''));
    const closeTime = Number.parseInt(hours.close.replace(':', ''));

    return currentTime >= openTime && currentTime <= closeTime;
  } catch (error: unknown) {
    console.error('Error parsing operating hours for truck', truck.name, error);
    return false;
  }
}
