require('dotenv').config({ path: '.env.local' });

async function resetAllRunningJobs() {
  console.log('=== Resetting All Running Jobs ===\n');
  
  // Import modules
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get all running jobs
  const { data: runningJobs, error: fetchError } = await supabase
    .from('scraping_jobs')
    .select('id, target_url, created_at')
    .eq('status', 'running');

  if (fetchError || !runningJobs || runningJobs.length === 0) {
    console.log('No running jobs found.');
    return;
  }

  console.log(`Found ${runningJobs.length} running jobs to reset:\n`);
  runningJobs.forEach(job => {
    const age = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60));
    console.log(`- ${job.target_url} (${age} hours old)`);
  });

  // Reset all to pending
  const { data, error: updateError } = await supabase
    .from('scraping_jobs')
    .update({ 
      status: 'pending',
      updated_at: new Date().toISOString()
    })
    .eq('status', 'running');

  if (updateError) {
    console.error('\n❌ Failed to reset jobs:', updateError.message);
    return;
  }

  console.log(`\n✅ Successfully reset ${runningJobs.length} jobs to pending status!`);
  
  // Show job count summary
  const { data: jobStats } = await supabase
    .from('scraping_jobs')
    .select('status');
  
  const stats = jobStats?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {}) || {};

  console.log('\n📊 Current job status:');
  Object.entries(stats).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });
}

resetAllRunningJobs().catch(console.error);
