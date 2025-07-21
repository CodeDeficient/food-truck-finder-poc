import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { processScrapingJob } from '../lib/pipelineProcessor.ts';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testSingleScrape() {
  console.log('=== Testing Single Scrape Job ===\n');

  // Get one pending job
  const { data: pendingJobs, error } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('status', 'pending')
    .limit(1);

  if (error || !pendingJobs || pendingJobs.length === 0) {
    console.log('No pending jobs found. Creating a test job...');
    
    // Create a test job
    const { data: newJob, error: createError } = await supabase
      .from('scraping_jobs')
      .insert({
        job_type: 'website_auto',
        target_url: 'https://eatrotirolls.com/',
        status: 'pending',
        priority: 10,
        scheduled_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) {
      console.error('Failed to create test job:', createError);
      return;
    }

    console.log('Created test job:', newJob.id);
    
    // Process the job
    console.log('\nProcessing job...');
    try {
      await processScrapingJob(newJob.id);
      console.log('✅ Job processed successfully!');
      
      // Check if food truck was created
      const { data: trucks } = await supabase
        .from('food_trucks')
        .select('*')
        .contains('source_urls', ['https://eatrotirolls.com/'])
        .limit(1);
      
      if (trucks && trucks.length > 0) {
        console.log('\n✅ Food truck created successfully!');
        console.log('Truck name:', trucks[0].name);
        console.log('Description:', trucks[0].description?.substring(0, 100) + '...');
      }
    } catch (error) {
      console.error('❌ Job processing failed:', error);
    }
  } else {
    const job = pendingJobs[0];
    console.log(`Found pending job: ${job.id}`);
    console.log(`URL: ${job.target_url}`);
    
    console.log('\nProcessing job...');
    try {
      await processScrapingJob(job.id);
      console.log('✅ Job processed successfully!');
    } catch (error) {
      console.error('❌ Job processing failed:', error);
    }
  }

  // Show final stats
  const { data: trucks, count: truckCount } = await supabase
    .from('food_trucks')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n📊 Total food trucks in database: ${truckCount}`);
}

testSingleScrape().catch(console.error);
