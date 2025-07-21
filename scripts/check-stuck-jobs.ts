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

async function checkStuckJobs() {
  console.log('Checking for stuck scraping jobs...\n');

  // Get all running jobs
  const { data: runningJobs, error } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('status', 'running')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching running jobs:', error);
    return;
  }

  console.log(`Found ${runningJobs.length} jobs in 'running' status`);
  
  // Check age of running jobs
  const now = new Date();
  const stuckJobs = runningJobs.filter(job => {
    const createdAt = new Date(job.created_at);
    const ageInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
    return ageInMinutes > 5; // Jobs running for more than 5 minutes are likely stuck
  });

  console.log(`\n${stuckJobs.length} jobs appear to be stuck (running for >5 minutes)`);

  if (stuckJobs.length > 0) {
    console.log('\nStuck jobs details:');
    stuckJobs.forEach(job => {
      const createdAt = new Date(job.created_at);
      const ageInMinutes = Math.round((now.getTime() - createdAt.getTime()) / (1000 * 60));
      console.log(`  Job ${job.id}: ${job.target_url} (${ageInMinutes} minutes old)`);
    });

    // Ask if we should reset these jobs
    console.log('\nTo reset these jobs to "failed" status, run:');
    console.log('npx tsx scripts/reset-stuck-jobs.ts');
  }

  // Check for any completed jobs to see the pattern
  const { data: completedJobs, error: completedError } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(5);

  if (!completedError && completedJobs.length > 0) {
    console.log(`\nFound ${completedJobs.length} completed jobs. Pattern analysis:`);
    completedJobs.forEach(job => {
      console.log(`  Job ${job.id}: ${job.target_url}`);
    });
  } else {
    console.log('\nNo completed jobs found in the database.');
  }
}

checkStuckJobs().catch(console.error);
