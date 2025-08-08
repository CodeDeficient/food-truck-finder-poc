import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkDiscoveredUrls() {
  try {
    console.log('🔍 Checking discovered_urls table...');
    
    // Get sample discovered URLs
    const { data: discoveredUrls, error } = await supabase
      .from('discovered_urls')
      .select('*')
      .limit(20);

    if (error) {
      console.error('❌ Error querying discovered_urls:', error);
      return;
    }

    console.log('📊 Found', discoveredUrls.length, 'discovered URLs:');
    discoveredUrls.forEach((url, index) => {
      console.log(`${index + 1}. ${url.url} (status: ${url.status})`);
    });

    // Check for URLs that have been processed multiple times
    console.log('\n🔍 Checking for repeatedly failing URLs...');
    const { data: scrapingJobs, error: jobsError } = await supabase
      .from('scraping_jobs')
      .select('target_url, status, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (jobsError) {
      console.error('❌ Error querying scraping_jobs:', jobsError);
      return;
    }

    // Group jobs by URL and count failures
    const urlStats = {};
    scrapingJobs.forEach(job => {
      if (!urlStats[job.target_url]) {
        urlStats[job.target_url] = { total: 0, failed: 0, completed: 0, lastStatus: job.status };
      }
      urlStats[job.target_url].total++;
      urlStats[job.target_url][job.status]++;
      if (!urlStats[job.target_url].lastStatus) {
        urlStats[job.target_url].lastStatus = job.status;
      }
    });

    // Show URLs with high failure rates
    console.log('\n📊 URL Processing Statistics:');
    Object.entries(urlStats)
      .filter(([_, stats]) => stats.failed > 0)
      .sort((a, b) => b[1].failed - a[1].failed)
      .slice(0, 10)
      .forEach(([url, stats]) => {
        const failureRate = ((stats.failed / stats.total) * 100).toFixed(1);
        console.log(`${url}: ${stats.failed}/${stats.total} failed (${failureRate}%)`);
      });

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkDiscoveredUrls().then(() => {
  console.log('\n✅ Discovered URLs check complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
