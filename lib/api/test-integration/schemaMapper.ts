import { ExtractedFoodTruckDetails, FoodTruckSchema, MenuCategory, MenuItem } from '@/lib/types';

export function mapExtractedDataToTruckSchema(
  extractedData: ExtractedFoodTruckDetails,
  sourceUrl: string,
  isDryRun: boolean,
): FoodTruckSchema {
  if (!extractedData || typeof extractedData !== 'object') {
    throw new Error('Invalid extractedData for mapping.');
  }

  const name = extractedData.name ?? 'Unknown Test Truck';
  const locationData = extractedData.current_location ?? {};
  const fullAddress = [
    locationData.address,
    locationData.city,
    locationData.state,
    locationData.zip_code,
  ]
    .filter(Boolean)
    .join(', ');

  return {
    name: name,
    description: extractedData.description ?? undefined,
    current_location: {
      lat: locationData.lat ?? 0,
      lng: locationData.lng ?? 0,
      address: fullAddress ?? locationData.raw_text ?? undefined,
      timestamp: new Date().toISOString(),
    },
    scheduled_locations: extractedData.scheduled_locations ?? undefined,
    operating_hours: extractedData.operating_hours ?? undefined,
    menu: (extractedData.menu ?? []).map((category: MenuCategory) => ({
      name: category.name ?? 'Uncategorized',
      items: (category.items ?? []).map((item: MenuItem) => ({
        name: item.name ?? 'Unknown Item',
        description: item.description ?? undefined,
        price:
          typeof item.price === 'number' || typeof item.price === 'string' ? item.price : undefined,
        dietary_tags: item.dietary_tags ?? [],
      })),
    })),
    contact_info: extractedData.contact_info ?? undefined,
    social_media: extractedData.social_media ?? undefined,
    cuisine_type: extractedData.cuisine_type ?? [],
    price_range: extractedData.price_range ?? undefined,
    specialties: extractedData.specialties ?? [],
    data_quality_score: isDryRun ? 0.5 : 0.6, // Differentiate test/dry run
    verification_status: 'pending',
    source_urls: [sourceUrl].filter(Boolean),
    last_scraped_at: new Date().toISOString(),
    ...(isDryRun && { test_run_flag: true }), // Add a flag for actual test saves if needed
  };
}
