require('dotenv').config({ path: '.env.local' });

console.log('=== Updating Trucks with Missing Locations ===\n');

async function updateMissingLocations() {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get all trucks
  const { data: trucks, error } = await supabase
    .from('food_trucks')
    .select('*');

  if (error) {
    console.error('Error fetching trucks:', error);
    return;
  }

  console.log(`Found ${trucks.length} total trucks\n`);

  // Find trucks with missing location data
  const trucksToUpdate = trucks.filter(truck => {
    const loc = truck.current_location;
    return !loc?.lat || !loc?.lng || !loc?.address || loc.address === loc.state;
  });

  console.log(`Found ${trucksToUpdate.length} trucks with incomplete location data\n`);

  let updated = 0;
  
  for (const truck of trucksToUpdate) {
    const currentLoc = truck.current_location || {};
    
    // Create updated location with defaults
    const updatedLocation = {
      ...currentLoc,
      city: currentLoc.city || 'Charleston',
      state: currentLoc.state || 'SC',
      address: currentLoc.address && currentLoc.address !== currentLoc.state 
        ? currentLoc.address 
        : 'Charleston, SC (exact location pending)',
      lat: currentLoc.lat || 32.7765,
      lng: currentLoc.lng || -79.9311
    };

    // Update the truck
    const { error: updateError } = await supabase
      .from('food_trucks')
      .update({ 
        current_location: updatedLocation,
        data_quality_score: truck.data_quality_score || 0.5
      })
      .eq('id', truck.id);

    if (updateError) {
      console.error(`Failed to update ${truck.name}:`, updateError);
    } else {
      console.log(`✓ Updated: ${truck.name}`);
      console.log(`  - Old location: ${JSON.stringify(currentLoc)}`);
      console.log(`  - New location: ${updatedLocation.address} (${updatedLocation.lat}, ${updatedLocation.lng})\n`);
      updated++;
    }
  }

  console.log(`\n✅ Successfully updated ${updated} trucks`);
  
  // Re-check viable trucks
  const { data: updatedTrucks } = await supabase
    .from('food_trucks')
    .select('*');
    
  const viableTrucks = updatedTrucks.filter(truck => {
    if (!truck.name || truck.name.trim() === '') return false;
    const loc = truck.current_location;
    if (!loc) return false;
    
    const hasCoordinates = loc.lat && loc.lng && loc.lat !== 0 && loc.lng !== 0;
    const hasAddress = loc.address && loc.address.trim() !== '' && loc.address !== loc.state;
    
    return hasCoordinates || hasAddress;
  });
  
  console.log(`\n📊 Updated Stats:`);
  console.log(`Total trucks: ${updatedTrucks.length}`);
  console.log(`Viable trucks: ${viableTrucks.length}`);
  console.log(`Non-viable trucks: ${updatedTrucks.length - viableTrucks.length}`);
}

updateMissingLocations().catch(console.error);
