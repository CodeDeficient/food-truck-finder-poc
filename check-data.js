import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking actual data in food_trucks table...');

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function checkData() {
  try {
    // Get all records with service role (bypasses RLS)
    const { data: allRecords, error: allError } = await supabase
      .from('food_trucks')
      .select('id, name, verification_status');

    if (allError) {
      console.error('❌ Error querying all records:', allError);
      return;
    }

    console.log(`📊 Total records in database: ${allRecords.length}`);
    
    if (allRecords.length === 0) {
      console.log('⚠️  The food_trucks table is completely empty!');
      console.log('💡 You need to add some test data first.');
      return;
    }

    // Group by verification status
    const statusCounts = {};
    allRecords.forEach(truck => {
      const status = truck.verification_status || 'null';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    console.log('\n📋 Records by verification_status:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`   ${status}: ${count} records`);
    });

    // Show some sample records
    console.log('\n🚛 Sample records:');
    allRecords.slice(0, 5).forEach((truck, index) => {
      console.log(`   ${index + 1}. ${truck.name} (status: ${truck.verification_status})`);
    });

    // Check what would be accessible with our policy
    const accessibleRecords = allRecords.filter(truck => 
      ['verified', 'pending'].includes(truck.verification_status)
    );

    console.log(`\n✅ Records that should be accessible with policy: ${accessibleRecords.length}`);

    if (accessibleRecords.length === 0) {
      console.log('⚠️  No records match our policy criteria (verified or pending)!');
      console.log('💡 We need to either:');
      console.log('   1. Update existing records to have verification_status = "verified" or "pending"');
      console.log('   2. Modify the policy to allow other statuses');
      
      console.log('\n🔧 Here\'s SQL to update existing records to "verified":');
      console.log('   UPDATE public.food_trucks SET verification_status = \'verified\';');
    } else {
      console.log('✅ These records should be visible to anonymous users:');
      accessibleRecords.forEach((truck, index) => {
        console.log(`   ${index + 1}. ${truck.name}`);
      });
    }

  } catch (error) {
    console.error('💥 Error:', error);
  }
}

checkData().then(() => {
  console.log('\n✅ Data check complete!');
  process.exit(0);
});
