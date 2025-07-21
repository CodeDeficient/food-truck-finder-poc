import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabaseStatus() {
  console.log('Checking database status...\n');

  // Check food trucks count
  const { count: truckCount, error: truckError } = await supabase
    .from('food_trucks')
    .select('*', { count: 'exact', head: true });

  if (truckError) {
    console.error('Error counting food trucks:', truckError);
  } else {
    console.log(`Total food trucks in database: ${truckCount}`);
  }

  // Check recent scraping jobs
  const { data: recentJobs, error: jobError } = await supabase
    .from('scraping_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (jobError) {
    console.error('Error fetching scraping jobs:', jobError);
  } else {
    console.log(`\nRecent scraping jobs (last 20):`);
    console.log('Status summary:');
    const statusCounts = recentJobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`);
    });

    // Show failed jobs details
    const failedJobs = recentJobs.filter(job => job.status === 'failed');
    if (failedJobs.length > 0) {
      console.log('\nFailed jobs:');
      failedJobs.forEach(job => {
        console.log(`  Job ${job.id}: ${job.error_message || 'No error message'}`);
      });
    }
  }

  // Check discovered URLs
  const { count: urlCount, error: urlError } = await supabase
    .from('discovered_urls')
    .select('*', { count: 'exact', head: true });

  if (urlError) {
    console.error('Error counting discovered URLs:', urlError);
  } else {
    console.log(`\nTotal discovered URLs: ${urlCount}`);
  }

  // Check activity logs for recent auto-scrape
  const { data: logs, error: logError } = await supabase
    .from('activity_logs')
    .select('*')
    .eq('action', 'auto_scrape_completed')
    .order('created_at', { ascending: false })
    .limit(5);

  if (logError) {
    console.error('Error fetching activity logs:', logError);
  } else {
    console.log('\nRecent auto-scrape completions:');
    logs.forEach(log => {
      console.log(`  ${log.created_at}: ${JSON.stringify(log.details)}`);
    });
  }
}

checkDatabaseStatus().catch(console.error);
