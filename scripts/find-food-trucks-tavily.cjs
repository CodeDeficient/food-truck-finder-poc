require('dotenv').config({ path: '.env.local' });

const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

async function findFoodTrucks() {
  console.log('=== Finding Food Trucks with Tavily ===\n');
  
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Search queries for different areas and specific trucks
  const searchQueries = [
    // General area searches
    'Charleston SC food trucks official website menu contact',
    'Mount Pleasant food truck business website hours location',
    'Greenville SC food truck vendor official site menu',
    'Columbia SC mobile food vendor website catering',
    'North Charleston food truck website schedule',
    
    // Specific food truck names (common ones in SC)
    '"Roti Rolls" food truck Charleston website',
    '"Dashi" food truck Charleston official site',
    '"Coastal Crust" food truck Mount Pleasant website',
    '"Holy City Cupcakes" food truck website Charleston',
    '"Braised in the South" food truck website',
    '"Charleston Caribbean Creole" food truck site',
    '"Pink Bellies" food truck Charleston website',
    '"Autobanh" food truck Charleston website menu',
    
    // Pattern searches for food truck websites
    'site:*.com "food truck" "menu" "contact" Charleston',
    'site:*.com "mobile kitchen" "catering" South Carolina',
    'inurl:foodtruck Charleston SC website',
    'inurl:food-truck Mount Pleasant website menu'
  ];

  console.log(`Running ${searchQueries.length} search queries...\n`);
  let totalAdded = 0;

  for (const query of searchQueries) {
    console.log(`🔍 Searching: "${query}"`);
    
    try {
      const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: TAVILY_API_KEY,
          query: query,
          search_depth: 'advanced',
          max_results: 20, // Tavily's maximum limit per search
          include_domains: [], // Search all domains
          exclude_domains: [
            'facebook.com',
            'instagram.com', 
            'twitter.com',
            'yelp.com',
            'tripadvisor.com',
            'doordash.com',
            'ubereats.com',
            'grubhub.com',
            'postmates.com',
            'seamless.com'
          ]
        })
      });

      if (!response.ok) {
        console.error(`  ❌ Tavily error: ${response.status}`);
        continue;
      }

      const data = await response.json();
      const results = data.results || [];
      
      console.log(`  ✓ Found ${results.length} results`);
      let addedCount = 0;
      let skippedCount = 0;

      // Process each result
      for (const result of results) {
        // Check if this looks like an actual food truck website
        const url = result.url;
        const title = result.title?.toLowerCase() || '';
        const content = result.content?.toLowerCase() || '';
        
        // Look for indicators this is a food truck website
        const isFoodTruckRelated = 
          title.includes('food truck') || title.includes('foodtruck') ||
          title.includes('mobile food') || title.includes('mobile kitchen') ||
          content.includes('food truck') || content.includes('foodtruck') ||
          content.includes('mobile food') || content.includes('mobile kitchen') ||
          (content.includes('catering') && content.includes('menu')) ||
          url.includes('foodtruck') || url.includes('food-truck');
        
        const isNotNewsOrBlog = 
          !url.includes('/news/') && !url.includes('/article/') &&
          !url.includes('/blog/') && !url.includes('.pdf') &&
          !url.includes('wikipedia.org') && !url.includes('eventbrite.com');
        
        if (isFoodTruckRelated && isNotNewsOrBlog) {
          console.log(`    ? Checking: ${url} (${title})`);
          
          // Check if URL already exists
          const { data: existing } = await supabase
            .from('scraping_jobs')
            .select('id')
            .eq('target_url', url)
            .single();
          
          if (!existing) {
            // Add to scraping queue
            const { error: insertError } = await supabase
              .from('scraping_jobs')
              .insert({
                target_url: url,
                status: 'pending',
                priority: 10, // High priority for Tavily-found URLs
                created_at: new Date().toISOString(),
                metadata: {
                  source: 'tavily',
                  query: query,
                  title: result.title
                }
              });
            
            if (!insertError) {
              console.log(`    + Added: ${url}`);
              addedCount++;
            }
          } else {
            skippedCount++;
          }
        }
      }
      
      console.log(`    → Added: ${addedCount}, Skipped: ${skippedCount}`);
      totalAdded += addedCount;
      
    } catch (error) {
      console.error(`  ❌ Error: ${error.message}`);
    }
    
    // Small delay between searches
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Show stats
  const { data: stats } = await supabase
    .from('scraping_jobs')
    .select('status')
    .eq('metadata->source', 'tavily');
  
  console.log(`\n✅ Complete! Added ${totalAdded} new food truck URLs from Tavily`);
  console.log(`Total pending jobs in queue: ${stats?.length || 0}`);
}

findFoodTrucks().catch(console.error);
