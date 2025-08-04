import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

(async () => {
  // Dynamically import the service after environment variables are set
  const { ScrapingJobService } = await import('./lib/supabase/services/scrapingJobService.js');

  async function updateJobStatus(jobId, status) {
    try {
      await ScrapingJobService.updateJobStatus(jobId, status);
      console.log(`Job ${jobId} status updated to ${status}`);
    } catch (error) {
      console.error(`Error updating job ${jobId} status:`, error);
    }
  }

  // Update the status of specific jobs to pending
  await updateJobStatus('eba049f7-c172-49c8-a786-251f05ed3227', 'pending');
  await updateJobStatus('d621dfd3-d087-4124-80e0-52cf73b5f494', 'pending');
  await updateJobStatus('5817a46f-5cbd-4dcc-81ce-eaf03ab9e7d4', 'pending');
})();
