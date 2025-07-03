import type { FoodTruck } from '@/lib/supabase';

export function getPlaceholderPatterns(): RegExp[] {
  return [
    /undefined/i,
    /placeholder/i,
    /example\.com/i,
    /test\s*truck/i,
    /lorem\s*ipsum/i,
    /\bna\b/i,
    /\bn\/a\b/i,
    /^0+$/,
    /^null$/i,
  ];
}

export function checkForPlaceholders(truck: FoodTruck, patterns: RegExp[]): Partial<FoodTruck> {
  const updates: Partial<FoodTruck> = {};

  if (truck.name && patterns.some((pattern) => pattern.test(truck.name ?? ''))) {
    updates.name = undefined;
  }
  if (
    truck.description !== undefined &&
    patterns.some((pattern) => pattern.test(truck.description ?? ''))
  ) {
    updates.description = undefined;
  }
  if (
    truck.price_range !== undefined &&
    patterns.some((pattern) => pattern.test(truck.price_range ?? ''))
  ) {
    updates.price_range = undefined;
  }
  return updates;
}

export function processTruckForPlaceholders(
  truck: FoodTruck,
  patterns: RegExp[],
): Partial<FoodTruck> {
  const basicInfoUpdates = checkForPlaceholders(truck, patterns);
  const contactInfoUpdates = processContactInfoForPlaceholders(truck, patterns);
  const addressUpdates = processAddressForPlaceholders(truck, patterns);

  const updates: Partial<FoodTruck> = {
    ...basicInfoUpdates,
    ...getContactInfoUpdates(truck, contactInfoUpdates),
    ...getLocationUpdates(truck, addressUpdates),
  };

  return updates;
}

function getContactInfoUpdates(
  truck: FoodTruck,
  contactInfoUpdates: Partial<FoodTruck['contact_info']>,
): Partial<FoodTruck> | object {
  if (Object.keys(contactInfoUpdates).length > 0) {
    return { contact_info: { ...truck.contact_info, ...contactInfoUpdates } };
  }
  return {};
}

function getLocationUpdates(
  truck: FoodTruck,
  addressUpdates: Partial<FoodTruck['current_location']>,
): Partial<FoodTruck> | object {
  if (Object.keys(addressUpdates).length > 0) {
    return { current_location: { ...truck.current_location, ...addressUpdates } };
  }
  return {};
}

function processContactInfoForPlaceholders(
  truck: FoodTruck,
  patterns: RegExp[],
): Partial<FoodTruck['contact_info']> {
  const cleanContact: Partial<FoodTruck['contact_info']> = {};

  if (
    truck.contact_info?.phone !== undefined &&
    patterns.some((pattern) => pattern.test(truck.contact_info.phone ?? ''))
  ) {
    cleanContact.phone = undefined;
  }
  if (
    truck.contact_info?.website !== undefined &&
    patterns.some((pattern) => pattern.test(truck.contact_info.website ?? ''))
  ) {
    cleanContact.website = undefined;
  }
  if (
    truck.contact_info?.email !== undefined &&
    patterns.some((pattern) => pattern.test(truck.contact_info.email ?? ''))
  ) {
    cleanContact.email = undefined;
  }
  return cleanContact;
}

function processAddressForPlaceholders(
  truck: FoodTruck,
  patterns: RegExp[],
): Partial<FoodTruck['current_location']> {
  const updatedLocation: Partial<FoodTruck['current_location']> = {};

  if (
    truck.current_location?.address !== undefined &&
    patterns.some((pattern) => pattern.test(truck.current_location.address ?? ''))
  ) {
    updatedLocation.address = undefined;
  }
  return updatedLocation;
}
