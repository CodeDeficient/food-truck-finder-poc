/**
 * Script to add sample events for Uprooted Vegan Cuisine
 * This shows Jennifer's food truck schedule and event appearances
 */

import { supabaseAdmin } from '../lib/supabase/client';

const uprootedEvents = [
  {
    title: "Weekly Meal Prep Pickup",
    description: "Pre-ordered weekly meals ready for pickup. Order Monday 6PM - Saturday 7PM for Monday pickup at various locations.",
    event_date: "2025-01-20", // Next Monday
    start_time: "15:00",
    end_time: "18:00",
    location_address: "359 Furys Ferry Rd, Martinez, GA 30907",
    location_lat: 33.526636,
    location_lng: -82.07125
  },
  {
    title: "Food Truck at Savannah River Brewing",
    description: "Juniper food truck serving fresh vegan meals at Savannah River Brewing Co. featuring seasonal specialties and customer favorites.",
    event_date: "2025-01-25", // Saturday
    start_time: "17:00",
    end_time: "21:00", 
    location_address: "813 5th Street, Augusta, GA 30901",
    location_lat: 33.4646051,
    location_lng: -81.963694
  },
  {
    title: "Weekly Meal Prep Pickup",
    description: "Pre-ordered weekly meals ready for pickup. Fresh seasonal menu featuring locally-sourced ingredients.",
    event_date: "2025-01-27", // Next Monday
    start_time: "15:00",
    end_time: "18:00",
    location_address: "359 Furys Ferry Rd, Martinez, GA 30907",
    location_lat: 33.526636,
    location_lng: -82.07125
  },
  {
    title: "Augusta Farmers Market Pop-up",
    description: "Special weekend appearance at local farmers market with fresh bowls, salads, and customer-favorite sugar heart cookies.",
    event_date: "2025-02-01", // Saturday
    start_time: "09:00",
    end_time: "14:00",
    location_address: "Augusta, GA",
    location_lat: 33.4734978,
    location_lng: -82.0105148
  },
  {
    title: "Private Cooking Class",
    description: "Learn to cook delicious plant-based meals with Jennifer. Space limited, advance booking required.",
    event_date: "2025-02-05", // Wednesday
    start_time: "18:00",
    end_time: "20:00",
    location_address: "359 Furys Ferry Rd, Martinez, GA 30907",
    location_lat: 33.526636,
    location_lng: -82.07125
  },
  {
    title: "Valentine's Day Special Menu",
    description: "Special romantic dinner packages for two with custom vegan desserts. Pre-order required for this limited-time offering.",
    event_date: "2025-02-14", // Valentine's Day
    start_time: "17:00",
    end_time: "19:00",
    location_address: "359 Furys Ferry Rd, Martinez, GA 30907",
    location_lat: 33.526636,
    location_lng: -82.07125
  }
];

async function addUprootedEvents() {
  if (!supabaseAdmin) {
    console.error('❌ Admin client required for adding events');
    return;
  }

  try {
    console.log('📅 Adding events for Uprooted Vegan Cuisine...\n');

    // First, get the food truck ID
    const { data: trucks, error: truckError } = await supabaseAdmin
      .from('food_trucks')
      .select('id')
      .eq('name', 'Uprooted Vegan Cuisine')
      .single();

    if (truckError || !trucks) {
      console.error('❌ Could not find Uprooted Vegan Cuisine truck:', truckError?.message);
      console.log('💡 Please run the add-uprooted-vegan-cuisine script first');
      return;
    }

    const truckId = trucks.id;
    console.log('🚚 Found truck ID:', truckId);

    // Add events with the truck ID
    const eventsWithTruckId = uprootedEvents.map(event => ({
      ...event,
      food_truck_id: truckId
    }));

    const { data: insertedEvents, error: eventsError } = await supabaseAdmin
      .from('events')
      .insert(eventsWithTruckId)
      .select();

    if (eventsError) {
      console.error('❌ Failed to add events:', eventsError.message);
      return;
    }

    console.log('✅ Successfully added events for Uprooted Vegan Cuisine!');
    console.log('📊 Total events added:', insertedEvents?.length || 0);
    
    console.log('\n📅 Upcoming Events:');
    insertedEvents?.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   📍 ${event.location_address}`);
      console.log(`   📅 ${event.event_date} at ${event.start_time}`);
      console.log(`   📝 ${event.description}`);
      console.log('');
    });

    console.log('🎉 Jennifer can now show her schedule to customers!');
    console.log('💡 Customers can see when and where to find Uprooted Vegan Cuisine');

  } catch (error) {
    console.error('💥 Unexpected error adding events:', error);
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  addUprootedEvents();
}

export default addUprootedEvents;
