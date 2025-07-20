import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Checking Supabase connection and data...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key present:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('\n🔍 Testing basic connection...');
    
    // First, let's try to list all tables
    console.log('📋 Listing all tables...');
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_table_names')
      .then(() => ({ data: ['Manual check needed'], error: null }))
      .catch(() => ({ data: null, error: 'Cannot list tables with current permissions' }));
    
    if (tablesError) {
      console.log('ℹ️  Cannot list tables (this is normal with RLS):', tablesError);
    } else {
      console.log('📋 Available tables:', tables);
    }

    // Check food_trucks table
    console.log('\n🚛 Checking food_trucks table...');
    const { data: foodTrucks, error: foodTrucksError, count } = await supabase
      .from('food_trucks')
      .select('*', { count: 'exact' });

    console.log('📊 Query result:');
    console.log('  - Error:', foodTrucksError);
    console.log('  - Count:', count);
    console.log('  - Data length:', foodTrucks ? foodTrucks.length : 'null');
    console.log('  - Raw data:', foodTrucks);

    if (foodTrucksError) {
      console.error('❌ Error querying food_trucks:', foodTrucksError);
      
      // Check if it's a permissions issue
      if (foodTrucksError.code === '42501') {
        console.log('\n🔐 This appears to be a permissions issue (RLS)');
        console.log('💡 Checking if RLS is enabled...');
        
        // Try to check RLS status
        const { data: rlsStatus, error: rlsError } = await supabase
          .rpc('check_rls_status')
          .then(() => ({ data: 'RLS check not available', error: null }))
          .catch((err) => ({ data: null, error: err.message }));
        
        console.log('🔒 RLS Status:', rlsStatus || 'Cannot determine');
      }
      
      return;
    }

    if (!foodTrucks || foodTrucks.length === 0) {
      console.log('⚠️  Table is empty or no data returned');
      
      // Let's try to insert a test record to see if we can write
      console.log('\n✏️  Testing insert permissions...');
      const testTruck = {
        name: 'Test Truck - Debug',
        current_location: { lat: 37.7749, lng: -122.4194 },
        cuisine_type: ['Test'],
        verification_status: 'pending'
      };
      
      const { data: insertData, error: insertError } = await supabase
        .from('food_trucks')
        .insert([testTruck])
        .select();
      
      if (insertError) {
        console.error('❌ Cannot insert test data:', insertError);
        console.log('💡 This suggests either RLS policies or table permissions issue');
      } else {
        console.log('✅ Successfully inserted test data:', insertData);
        
        // Clean up - delete the test data
        if (insertData && insertData.length > 0) {
          const { error: deleteError } = await supabase
            .from('food_trucks')
            .delete()
            .eq('id', insertData[0].id);
          
          if (deleteError) {
            console.warn('⚠️  Could not clean up test data:', deleteError);
          } else {
            console.log('🧹 Cleaned up test data');
          }
        }
      }
      
      return;
    }

    console.log('✅ Found', foodTrucks.length, 'food trucks!');
    console.log('\n📋 Sample records:');
    foodTrucks.slice(0, 3).forEach((truck, index) => {
      console.log(`\n🚛 Truck ${index + 1}:`);
      console.log('  - ID:', truck.id);
      console.log('  - Name:', truck.name);
      console.log('  - Cuisine:', truck.cuisine_type);
      console.log('  - Status:', truck.verification_status);
      console.log('  - Is Active:', truck.is_active);
    });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkDatabase().then(() => {
  console.log('\n✅ Database check complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
