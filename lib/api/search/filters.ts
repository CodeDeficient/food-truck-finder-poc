import { MenuCategory, MenuItem, OperatingHours, type FoodTruck } from '@/lib/types';

export function applyTextSearchFilter(trucks: FoodTruck[], query: string | null): FoodTruck[] {
  if (query != undefined && query !== '') {
    return trucks.filter(
      (truck: FoodTruck) =>
        truck.name.toLowerCase().includes(query.toLowerCase()) ||
        (truck.description?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
        (truck.menu?.some((category: MenuCategory) =>
          category.items?.some(
            (item: MenuItem) =>
              item.name.toLowerCase().includes(query.toLowerCase()) ||
              (item.description?.toLowerCase().includes(query.toLowerCase()) ?? false),
          ),
        ) ??
          false),
    );
  }
  return trucks;
}

export function applyCuisineFilter(trucks: FoodTruck[], cuisine: string | null): FoodTruck[] {
  if (cuisine != undefined && cuisine !== '') {
    return trucks.filter((truck: FoodTruck) =>
      truck.menu?.some((category: MenuCategory) =>
        category.name.toLowerCase().includes(cuisine.toLowerCase()),
      ),
    );
  }
  return trucks;
}

export function applyOpenNowFilter(trucks: FoodTruck[], openNow: boolean): FoodTruck[] {
  if (openNow) {
    const now = new Date();
    const daysOfWeek: Array<keyof OperatingHours> = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const currentDay = daysOfWeek[now.getDay()];
    const currentTime = now.getHours() * 100 + now.getMinutes();

    return trucks.filter((truck: FoodTruck) => {
      const hours = truck.operating_hours?.[currentDay];
      if (!hours || hours.closed) return false;

      const openTime = Number.parseInt(hours.open.replace(':', ''));
      const closeTime = Number.parseInt(hours.close.replace(':', ''));
      return currentTime >= openTime && currentTime <= closeTime;
    });
  }
  return trucks;
}
