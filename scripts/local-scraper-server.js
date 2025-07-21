import express from 'express';
import dotenv from 'dotenv';
import { CronJob } from 'cron';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '.env.local' });

const app = express();
app.use(express.json());

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Import the actual scraping logic
async function runScrapingBatch(limit = 3) {
  console.log(`\n[${new Date().toISOString()}] Starting scraping batch (limit: ${limit})...`);
  
  try {
    // Get pending jobs
    const { data: pendingJobs, error: fetchError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('priority', { ascending: false })
      .limit(limit);

    if (fetchError) {
      console.error('Error fetching pending jobs:', fetchError);
      return { processed: 0, succeeded: 0, failed: 0 };
    }

    console.log(`Found ${pendingJobs.length} pending jobs to process`);

    const results = {
      processed: 0,
      succeeded: 0,
      failed: 0
    };

    // Import the processing function dynamically to avoid module issues
    const { processScrapingJob } = await import('../lib/pipelineProcessor.js');

    for (const job of pendingJobs) {
      console.log(`Processing job ${job.id} for URL: ${job.target_url}`);
      results.processed++;

      try {
        await processScrapingJob(job.id);
        results.succeeded++;
        console.log(`✓ Successfully processed job ${job.id}`);
      } catch (error) {
        results.failed++;
        console.error(`✗ Failed to process job ${job.id}:`, error.message);
        
        // Mark job as failed
        await supabase
          .from('scraping_jobs')
          .update({
            status: 'failed',
            error_message: error.message,
            updated_at: new Date().toISOString()
          })
          .eq('id', job.id);
      }

      // Add delay between jobs to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`Batch complete:`, results);
    return results;
  } catch (error) {
    console.error('Scraping batch failed:', error);
    return { processed: 0, succeeded: 0, failed: 0 };
  }
}

// REST API endpoints
app.get('/status', async (req, res) => {
  const { data: jobStats } = await supabase
    .from('scraping_jobs')
    .select('status');
  
  const stats = jobStats?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {}) || {};

  res.json({
    status: 'running',
    jobStats: stats,
    uptime: process.uptime()
  });
});

app.post('/scrape', async (req, res) => {
  const { limit = 3 } = req.body;
  console.log('Manual scraping triggered via API');
  
  const results = await runScrapingBatch(limit);
  res.json(results);
});

app.post('/create-jobs', async (req, res) => {
  console.log('Creating new scraping jobs...');
  
  try {
    const { autoScraper } = await import('../lib/autoScraper.js');
    const urls = await autoScraper.getUrlsToScrape();
    
    let created = 0;
    for (const url of urls) {
      const { error } = await supabase
        .from('scraping_jobs')
        .insert({
          job_type: 'website_auto',
          target_url: url,
          status: 'pending',
          priority: 5,
          scheduled_at: new Date().toISOString()
        });
      
      if (!error) created++;
    }
    
    res.json({ created, total: urls.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// CRON jobs
const jobs = {
  // Run every 30 minutes
  scraper: new CronJob('*/30 * * * *', async () => {
    console.log('\n========== CRON: Scraping Job ==========');
    await runScrapingBatch(5);
  }, null, false),

  // Run every hour
  jobCreator: new CronJob('0 * * * *', async () => {
    console.log('\n========== CRON: Creating Jobs ==========');
    const { autoScraper } = await import('../lib/autoScraper.js');
    const result = await autoScraper.runAutoScraping();
    console.log('Jobs created:', result);
  }, null, false),

  // Run every 6 hours
  cleanup: new CronJob('0 */6 * * *', async () => {
    console.log('\n========== CRON: Cleanup Old Jobs ==========');
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    
    const { error } = await supabase
      .from('scraping_jobs')
      .delete()
      .eq('status', 'failed')
      .lt('created_at', threeDaysAgo);
    
    if (!error) {
      console.log('Cleaned up old failed jobs');
    }
  }, null, false)
};

// Start server
const PORT = process.env.SCRAPER_PORT || 3001;
app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║     Local Food Truck Scraper Server        ║
╠════════════════════════════════════════════╣
║  Status: http://localhost:${PORT}/status      ║
║                                            ║
║  API Endpoints:                            ║
║  - POST /scrape     (manual scraping)      ║
║  - POST /create-jobs (create new jobs)     ║
║                                            ║
║  CRON Schedule:                            ║
║  - Scraping: Every 30 minutes              ║
║  - Job Creation: Every hour                ║
║  - Cleanup: Every 6 hours                  ║
╚════════════════════════════════════════════╝
  `);

  // Ask if user wants to start CRON jobs
  console.log('\nStart CRON jobs? (y/n)');
  
  process.stdin.once('data', (data) => {
    const answer = data.toString().trim().toLowerCase();
    if (answer === 'y') {
      Object.values(jobs).forEach(job => job.start());
      console.log('✓ CRON jobs started');
      
      // Run initial batch
      console.log('\nRunning initial scraping batch...');
      runScrapingBatch(2);
    } else {
      console.log('CRON jobs not started. Use API endpoints for manual control.');
    }
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  Object.values(jobs).forEach(job => job.stop());
  process.exit(0);
});
