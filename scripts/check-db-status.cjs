require('dotenv').config({ path: '.env.local' });

async function checkStatus() {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('=== Database Status ===\n');

  // Check food trucks
  const { data: trucks, count: truckCount } = await supabase
    .from('food_trucks')
    .select('*', { count: 'exact' })
    .limit(5);
  
  console.log(`📱 Food Trucks: ${truckCount || 0} total`);
  if (trucks && trucks.length > 0) {
    console.log('Sample trucks:');
    trucks.forEach(t => {
      console.log(`  - ${t.name} (${t.verification_status})`);
    });
  }

  // Check scraping jobs
  const { data: jobs } = await supabase
    .from('scraping_jobs')
    .select('status')
    .neq('status', 'completed');

  const jobCounts = {};
  jobs?.forEach(job => {
    jobCounts[job.status] = (jobCounts[job.status] || 0) + 1;
  });

  console.log('\n📋 Scraping Jobs:');
  Object.entries(jobCounts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Check recent completed jobs
  const { data: recentCompleted } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5);

  console.log('\n✅ Recent Completed Jobs:');
  if (recentCompleted && recentCompleted.length > 0) {
    recentCompleted.forEach(job => {
      console.log(`  - ${job.target_url}`);
      if (job.data_collected) {
        console.log(`    → ${job.data_collected.name || 'No name'}`);
      }
    });
  } else {
    console.log('  None found');
  }

  // Check recent failed jobs
  const { data: recentFailed } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('status', 'failed')
    .order('updated_at', { ascending: false })
    .limit(5);

  console.log('\n❌ Recent Failed Jobs:');
  if (recentFailed && recentFailed.length > 0) {
    recentFailed.forEach(job => {
      console.log(`  - ${job.target_url}`);
      if (job.errors && job.errors.length > 0) {
        console.log(`    → ${job.errors[0]}`);
      }
    });
  } else {
    console.log('  None found');
  }
}

checkStatus().catch(console.error);
