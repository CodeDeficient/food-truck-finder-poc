require('dotenv').config({ path: '.env.local' });

async function cleanQueue() {
  console.log('=== Cleaning Scraping Queue ===\n');
  
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get all pending jobs
  const { data: pendingJobs, error } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('status', 'pending');

  if (error || !pendingJobs) {
    console.error('Error fetching jobs:', error);
    return;
  }

  console.log(`Found ${pendingJobs.length} pending jobs to check`);

  const badUrls = [];
  const goodUrls = [];

  // Check each URL
  for (const job of pendingJobs) {
    const url = job.target_url;
    
    // Bad URL patterns
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.gif') ||
        url.includes('.css') || url.includes('.js') || url.includes('facebook.com') ||
        url.includes('instagram.com') || url.includes('twitter.com') || 
        url.includes('linkedin.com') || url.includes('reddit.com') ||
        url.includes('whatsapp.com') || url.includes('/login') ||
        url.includes('/user_') || url.includes('/images/') ||
        url.includes('/static/') || url.includes('/assets/') ||
        url.includes('googleapis.com') || url.includes('gstatic.com') ||
        url.includes('cloudinary.com') || url.includes('spotapps.co') ||
        url.includes('openstreetmap.org') || url.includes('cartodb') ||
        url.includes('#') || url.includes('?page=') ||
        url.includes('/join') || url.includes('/contact') ||
        url.includes('/about') || url.includes('/privacy') ||
        url.includes('translate.google.com') || url.includes('fonts.gstatic.com') ||
        url.includes('/alabama/') || url.includes('/alaska/') || 
        url.includes('/arizona/') || url.includes('/arkansas/') ||
        url.includes('/california/') || url.includes('/colorado/') ||
        // Skip state-level pages
        url.match(/\/[a-z]+\/$/) && !url.includes('food-truck')) {
      badUrls.push(job);
    } else {
      goodUrls.push(job);
    }
  }

  console.log(`\n✅ Good URLs: ${goodUrls.length}`);
  console.log(`❌ Bad URLs to remove: ${badUrls.length}`);

  if (badUrls.length > 0) {
    console.log('\nRemoving bad URLs...');
    
    // Delete bad URLs in batches
    const batchSize = 100;
    for (let i = 0; i < badUrls.length; i += batchSize) {
      const batch = badUrls.slice(i, i + batchSize);
      const ids = batch.map(job => job.id);
      
      const { error: deleteError } = await supabase
        .from('scraping_jobs')
        .delete()
        .in('id', ids);
      
      if (deleteError) {
        console.error('Error deleting batch:', deleteError);
      } else {
        console.log(`  Deleted batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(badUrls.length/batchSize)}`);
      }
    }
    
    console.log('\n✅ Queue cleaned!');
  } else {
    console.log('\n✅ No bad URLs found!');
  }

  // Show remaining good URLs sample
  console.log('\nSample of remaining good URLs:');
  goodUrls.slice(0, 10).forEach(job => {
    console.log(`  - ${job.target_url}`);
  });
}

cleanQueue().catch(console.error);
