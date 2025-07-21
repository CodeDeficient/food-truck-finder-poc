import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkCronIssue() {
  console.log('=== Checking CRON Job Issues ===\n');

  // Check food trucks count
  const { data: trucks, count: truckCount } = await supabase
    .from('food_trucks')
    .select('*', { count: 'exact', head: true });
  
  console.log(`Total Food Trucks: ${truckCount}`);

  // Check scraping jobs
  const { data: runningJobs, error: runningError } = await supabase
    .from('scraping_jobs')
    .select('id, status, created_at, target_url')
    .eq('status', 'running')
    .order('created_at', { ascending: false });

  if (runningError) {
    console.error('Error fetching running jobs:', runningError);
  } else {
    console.log(`\nRunning Scraping Jobs: ${runningJobs.length}`);
    if (runningJobs.length > 0) {
      console.log('\nSample of stuck jobs:');
      runningJobs.slice(0, 5).forEach(job => {
        const age = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60 * 24));
        console.log(`- ID: ${job.id} | Age: ${age} days | URL: ${job.target_url}`);
      });
    }
  }

  // Check job status distribution
  const { data: statusCounts, error: statusError } = await supabase
    .from('scraping_jobs')
    .select('status');
  
  if (!statusError && statusCounts) {
    const statusMap = {};
    statusCounts.forEach(job => {
      statusMap[job.status] = (statusMap[job.status] || 0) + 1;
    });
    console.log('\nJob Status Distribution:');
    Object.entries(statusMap).forEach(([status, count]) => {
      console.log(`- ${status}: ${count}`);
    });
  }

  // Check last successful completions
  const { data: completedJobs, error: completedError } = await supabase
    .from('scraping_jobs')
    .select('id, completed_at, target_url')
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(5);

  if (!completedError && completedJobs) {
    console.log('\nLast Completed Jobs:');
    completedJobs.forEach(job => {
      console.log(`- ID: ${job.id} | Completed: ${job.completed_at} | URL: ${job.target_url}`);
    });
  }

  // Check if service role key has proper permissions
  console.log('\n=== Testing Database Write Permissions ===');
  const testJob = {
    job_type: 'test',
    target_url: 'https://test.example.com',
    status: 'pending',
    priority: 1,
    scheduled_at: new Date().toISOString()
  };

  const { data: insertTest, error: insertError } = await supabase
    .from('scraping_jobs')
    .insert([testJob])
    .select()
    .single();

  if (insertError) {
    console.error('Error inserting test job:', insertError);
    console.log('This might indicate permission issues with the service role key.');
  } else {
    console.log('Successfully created test job:', insertTest.id);
    
    // Clean up test job
    const { error: deleteError } = await supabase
      .from('scraping_jobs')
      .delete()
      .eq('id', insertTest.id);
    
    if (deleteError) {
      console.error('Error deleting test job:', deleteError);
    } else {
      console.log('Test job cleaned up successfully.');
    }
  }

  console.log('\n=== Summary ===');
  console.log(`The issue appears to be that jobs are created and marked as 'running' but never complete.`);
  console.log(`This suggests the processScrapingJob function may be failing silently.`);
  console.log(`\nPossible causes:`);
  console.log(`1. Vercel function timeouts (functions have 10s limit on hobby plan)`);
  console.log(`2. External API failures (Firecrawl/Gemini)`);
  console.log(`3. Database write permissions after processing`);
  console.log(`4. Async processing not being awaited properly`);
}

checkCronIssue().catch(console.error);
