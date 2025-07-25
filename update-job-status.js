import dotenv from 'dotenv';
dotenv.config();

import { ScrapingJobService } from './lib/supabase/services/scrapingJobService.js';

async function updateJobStatus(jobId, status) {
  try {
    await ScrapingJobService.updateJobStatus(jobId, status);
    console.log(`Job ${jobId} status updated to ${status}`);
  } catch (error) {
    console.error(`Error updating job ${jobId} status:`, error);
  }
}

// Update the status of specific jobs
updateJobStatus('eba049f7-c172-49c8-a786-251f05ed3227', 'pending');
updateJobStatus('d621dfd3-d087-4124-80e0-52cf73b5f494', 'pending');
updateJobStatus('5817a46f-5cbd-4dcc-81ce-eaf03ab9e7d4', 'pending');
