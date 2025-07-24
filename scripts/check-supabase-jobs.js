import dotenv from 'dotenv';
import { ScrapingJobService } from '../lib/supabase/services/scrapingJobService.js';

// Load environment variables from .env.local.example
dotenv.config({ path: '.env.local.example' });

async function checkSupabaseJobs() {
  console.log(process.env);
  console.log('Connecting to Supabase to check job statuses...');

  try {
    const allJobs = await ScrapingJobService.getAllJobs(100, 0);
    const pendingJobs = await ScrapingJobService.getJobsByStatus('pending');
    const runningJobs = await ScrapingJobService.getJobsByStatus('running');
    const failedJobs = await ScrapingJobService.getJobsByStatus('failed');
    const completedJobs = await ScrapingJobService.getJobsByStatus('completed');

    console.log(`\n--- Job Status Summary ---`);
    console.log(`Total Jobs: ${allJobs.length}`);
    console.log(`Pending: ${pendingJobs.length}`);
    console.log(`Running: ${runningJobs.length}`);
    console.log(`Failed: ${failedJobs.length}`);
    console.log(`Completed: ${completedJobs.length}`);
    console.log(`--------------------------\n`);

    if (allJobs.length > 0) {
      console.log('--- Details of Recent Jobs ---');
      allJobs.slice(0, 20).forEach(job => {
        console.log(
          `Job ID: ${job.id} | Status: ${job.status} | Created: ${job.created_at} | Target: ${job.target_url}`
        );
      });
      console.log(`--------------------------------\n`);
    }

    if (pendingJobs.length === 0) {
      console.log(' निष्कर्ष: No pending jobs found. This is likely why the action is not producing logs.');
    } else {
      console.log(' निष्कर्ष: Pending jobs exist. The issue may be elsewhere.');
    }
  } catch (error) {
    console.error('Error connecting to Supabase or fetching jobs:', error);
  }
}

checkSupabaseJobs();
