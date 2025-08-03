
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { parseArgs } from 'node:util';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials! Need both URL and SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Parse command line arguments
const options = {
  status: {
    type: 'string',
    short: 's'
  },
  limit: {
    type: 'string',
    short: 'l',
    default: '100'
  },
  help: {
    type: 'boolean',
    short: 'h',
    default: false
  }
};

const { values } = parseArgs({ options, allowPositionals: false });

if (values.help) {
  console.log(`
Get Scraping Jobs

Usage: node get-scraping-jobs.js [options]

Options:
  -s, --status <status>  Filter by job status (pending, running, completed, failed)
  -l, --limit <number>   Limit number of results (default: 100)
  -h, --help            Show this help message
  `);
  process.exit(0);
}

async function getScrapingJobs() {
  try {
    let query = supabase
      .from('scraping_jobs')
      .select('id, status, target_url, created_at, completed_at');
    
    // Apply status filter if provided
    if (values.status) {
      query = query.eq('status', values.status);
    }
    
    // Apply limit
    const limit = Number.parseInt(values.limit || '100', 10);
    query = query.limit(limit);
    
    // Order by creation date
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

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
