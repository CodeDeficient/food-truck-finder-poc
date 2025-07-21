require('dotenv').config({ path: '.env.local' });

async function checkPendingUrls() {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data } = await supabase
    .from('scraping_jobs')
    .select('target_url, priority')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .limit(30);

  console.log('=== Pending URLs ===\n');
  
  const grouped = {};
  data?.forEach(job => {
    const domain = new URL(job.target_url).hostname;
    if (!grouped[domain]) grouped[domain] = [];
    grouped[domain].push(job.target_url);
  });

  Object.entries(grouped).forEach(([domain, urls]) => {
    console.log(`\n${domain} (${urls.length} URLs):`);
    urls.slice(0, 3).forEach(url => {
      console.log(`  - ${url}`);
    });
    if (urls.length > 3) {
      console.log(`  ... and ${urls.length - 3} more`);
    }
  });
}

checkPendingUrls().catch(console.error);
