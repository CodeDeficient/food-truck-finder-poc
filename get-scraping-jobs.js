
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

async function getScrapingJobs() {
  try {
    const { data, error } = await supabase
      .from('scraping_jobs')
      .select('id, status, target_url');

    if (error) {
      throw error;
    }

    console.log('📊 Scraping Jobs:');
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('💥 Error fetching scraping jobs:', error.message);
    process.exit(1);
  }
}

getScrapingJobs();
