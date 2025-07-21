import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function resetStuckJobs() {
  console.log('=== Resetting Stuck Scraping Jobs ===\n');

  // Get all running jobs
  const { data: runningJobs, error: fetchError } = await supabase
    .from('scraping_jobs')
    .select('id, created_at')
    .eq('status', 'running');

  if (fetchError) {
    console.error('Error fetching running jobs:', fetchError);
    return;
  }

  console.log(`Found ${runningJobs.length} stuck jobs to reset.`);

  // Reset jobs that are older than 1 hour
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const stuckJobs = runningJobs.filter(job => job.created_at < oneHourAgo);

  console.log(`Resetting ${stuckJobs.length} jobs older than 1 hour...`);

  for (const job of stuckJobs) {
    const { error: updateError } = await supabase
      .from('scraping_jobs')
      .update({
        status: 'failed',
        errors: ['Job timed out - likely due to Vercel function timeout'],
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);

    if (updateError) {
      console.error(`Failed to reset job ${job.id}:`, updateError);
    } else {
      console.log(`Reset job ${job.id} to failed status`);
    }
  }

  console.log('\nDone!');
}

resetStuckJobs().catch(console.error);
