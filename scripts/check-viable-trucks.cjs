require('dotenv').config({ path: '.env.local' });

async function checkViableTrucks() {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: trucks } = await supabase
    .from('food_trucks')
    .select('*');

  console.log(`\n=== Truck Viability Analysis ===`);
  console.log(`Total trucks in database: ${trucks.length}`);

  // Check viability criteria
  const viable = trucks.filter(truck => {
    // Must have a name
    if (!truck.name || truck.name.trim() === '' || truck.name === 'Unnamed Truck') {
      return false;
    }
    
    // Must have location data
    if (!truck.current_location) {
      return false;
    }
    
    // Must have either coordinates OR a meaningful address
    const hasCoordinates = 
      typeof truck.current_location.lat === 'number' && 
      typeof truck.current_location.lng === 'number';
      
    const hasAddress = 
      truck.current_location.address && 
      truck.current_location.address.trim() !== '' &&
      truck.current_location.address !== 'Unknown';
    
    return hasCoordinates || hasAddress;
  });

  console.log(`Viable trucks (would show in app): ${viable.length}`);
  console.log(`Non-viable trucks: ${trucks.length - viable.length}`);

  // Analyze why trucks are not viable
  const noName = trucks.filter(t => !t.name || t.name.trim() === '' || t.name === 'Unnamed Truck');
  const noLocation = trucks.filter(t => !t.current_location);
  const noCoords = trucks.filter(t => t.current_location && 
    (typeof t.current_location.lat !== 'number' || typeof t.current_location.lng !== 'number'));
  const noAddress = trucks.filter(t => t.current_location && 
    (!t.current_location.address || t.current_location.address.trim() === '' || t.current_location.address === 'Unknown'));

  console.log(`\nBreakdown of issues:`);
  console.log(`- Missing name: ${noName.length}`);
  console.log(`- Missing location object: ${noLocation.length}`);
  console.log(`- Missing coordinates: ${noCoords.length}`);
  console.log(`- Missing address: ${noAddress.length}`);
  console.log(`- Missing both coords AND address: ${noCoords.filter(t => noAddress.includes(t)).length}`);

  console.log(`\nSample of non-viable trucks:`);
  const nonViable = trucks.filter(t => !viable.includes(t));
  nonViable.slice(0, 5).forEach(truck => {
    console.log(`\n"${truck.name}":`);
    console.log(`  - Location: ${JSON.stringify(truck.current_location)}`);
    console.log(`  - Data quality score: ${truck.data_quality_score}`);
  });
}

checkViableTrucks().catch(console.error);
