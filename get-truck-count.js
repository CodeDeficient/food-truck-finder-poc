
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials! Need both URL and SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function getTruckCount() {
  try {
    const { count, error } = await supabase
      .from('food_trucks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    console.log(`🚚 Found ${count} food trucks.`);
  } catch (error) {
    console.error('💥 Error fetching food truck count:', error.message);
    process.exit(1);
  }
}

getTruckCount();
