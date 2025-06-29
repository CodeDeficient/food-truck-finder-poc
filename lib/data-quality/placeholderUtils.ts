import { type FoodTruck } from '@/lib/supabase';

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

export function processTruckForPlaceholders(
  truck: FoodTruck,
  patterns: RegExp[],
): Partial<FoodTruck> | null {
  const updates: Partial<FoodTruck> = {};
  let needsUpdate = false;

  // Check name
  if (truck.name && patterns.some(pattern => pattern.test(truck.name ?? ''))) {
    updates.name = undefined;
    needsUpdate = true;
  }

  // Check description
  if (truck.description !== undefined && typeof truck.description === 'string' && patterns.some(pattern => pattern.test(truck.description ?? ''))) {
    updates.description = undefined;
    needsUpdate = true;
  }

  // Check price range
  if (truck.price_range !== undefined && typeof truck.price_range === 'string' && patterns.some(pattern => pattern.test(truck.price_range ?? ''))) {
    updates.price_range = undefined;
    needsUpdate = true;
  }

  // Check contact info
  if (truck.contact_info) {
    const cleanContact: Partial<FoodTruck['contact_info']> = {}; // Initialize as potentially empty
    let contactUpdated = false;

    if (truck.contact_info.phone && patterns.some(pattern => pattern.test(truck.contact_info.phone ?? ''))) {
      cleanContact.phone = undefined;
      contactUpdated = true;
    } else if (truck.contact_info.phone) {
      cleanContact.phone = truck.contact_info.phone;
    }

    if (truck.contact_info.website && patterns.some(pattern => pattern.test(truck.contact_info.website ?? ''))) {
      cleanContact.website = undefined;
      contactUpdated = true;
    } else if (truck.contact_info.website) {
      cleanContact.website = truck.contact_info.website;
    }

    if (truck.contact_info.email && patterns.some(pattern => pattern.test(truck.contact_info.email ?? ''))) {
      cleanContact.email = undefined;
      contactUpdated = true;
    } else if (truck.contact_info.email) {
      cleanContact.email = truck.contact_info.email;
    }

    // Only assign cleanContact to updates.contact_info if any part of it was actually modified or if it's intended to overwrite.
    // If contactUpdated is true, it means at least one field was cleared.
    // If contactUpdated is false, but we still want to ensure updates.contact_info reflects the (potentially partial) cleanContact,
    // we need to decide if an empty cleanContact (if all fields were null/undefined originally) should result in updates.contact_info = {}.
    // For now, only assign if something was actually changed to undefined OR if we want to ensure a "cleaned" object structure.
    // Let's assume we only update if a field was actively cleared.
    if (contactUpdated) {
      updates.contact_info = {
        ...truck.contact_info, // spread original first
        ...cleanContact       // then overwrite with cleaned/undefined fields
      };
      needsUpdate = true;
    }
  }

  // Check address
  if (truck.current_location?.address && patterns.some(pattern => pattern.test(truck.current_location.address ?? ''))) {
    updates.current_location = {
      ...(truck.current_location as FoodTruck['current_location']), // Cast to ensure all props are there if spreading
      address: undefined,
    };
    needsUpdate = true;
  }

  return needsUpdate ? updates : null;
}
