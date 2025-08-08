require('dotenv').config({ path: '.env.local' });

const BATCH_SIZE = 5; // Process 5 jobs at a time
const INTERVAL_MINUTES = 5; // Run every 5 minutes

console.log('=== Enhanced Scraper with Listing Extraction ===');
console.log(`- Batch size: ${BATCH_SIZE} jobs`);
console.log(`- Running every: ${INTERVAL_MINUTES} minutes`);
console.log('\nPress Ctrl+C to stop\n');

async function processBatch() {
  const startTime = new Date();
  console.log(`\n[${startTime.toLocaleTimeString()}] Starting batch processing...`);
  
  // Import modules
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get pending jobs
  const { data: pendingJobs, error } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .limit(BATCH_SIZE);

  if (error || !pendingJobs || pendingJobs.length === 0) {
    console.log('No pending jobs found.');
    return;
  }

  console.log(`Found ${pendingJobs.length} pending jobs to process`);

  // Process each job
  for (const job of pendingJobs) {
    console.log(`\n📋 Processing: ${job.target_url}`);
    
    // Update to running
    await supabase
      .from('scraping_jobs')
      .update({ status: 'running', updated_at: new Date().toISOString() })
      .eq('id', job.id);

    try {
      // Scrape with Firecrawl
      const scrapeResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: job.target_url,
          formats: ['markdown'],
          waitFor: 2000
        })
      });

      if (!scrapeResponse.ok) {
        throw new Error(`Firecrawl error: ${scrapeResponse.status}`);
      }

      const scrapeData = await scrapeResponse.json();
      console.log(`  ✓ Scraped (${scrapeData.data?.markdown?.length || 0} chars)`);

      // First try to extract food truck data
      const extractPrompt = `Analyze this webpage content. If this is a single food truck's website, extract the truck information. If this is a listing/directory page with multiple food trucks, return {"is_listing": true}.

Website URL: ${job.target_url}
Content:
${scrapeData.data?.markdown?.substring(0, 10000)}

If single food truck, return JSON with these fields:
- name: string (food truck name)
- description: string (brief description)
- cuisine_type: string[] (types of food served)
- price_range: string ($ or $$ or $$$ or $$$$)
- specialties: string[] (signature dishes)
- contact_info: { phone?: string, email?: string, website?: string }
- social_media: { instagram?: string, facebook?: string, twitter?: string }
- current_location: { address?: string, city?: string, state?: string }

If listing page, return: {"is_listing": true}

Return ONLY valid JSON, no explanations.`;

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: extractPrompt }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 2048
          }
        })
      });

      if (!geminiResponse.ok) {
        throw new Error(`Gemini error: ${geminiResponse.status}`);
      }

      const geminiData = await geminiResponse.json();
      const extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
      
      // Parse JSON
      let extractedData = {};
      try {
        const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          let cleanJson = jsonMatch[0]
            .replace(/,\s*}/g, '}')
            .replace(/,\s*]/g, ']')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ');
          extractedData = JSON.parse(cleanJson);
        }
      } catch (e) {
        extractedData = { name: 'Unknown' };
      }

      // Check if it's a listing page
      if (extractedData.is_listing) {
        console.log(`  📑 Detected listing page, extracting truck URLs...`);
        
        // Extract URLs that look like food truck pages
        const listingPrompt = `Extract all individual food truck website URLs from this listing page. Only include URLs that lead to individual food truck websites or pages, not other listing pages.

Content:
${scrapeData.data?.markdown?.substring(0, 15000)}

Return a JSON array of URLs like: {"urls": ["url1", "url2", ...]}`;

        const urlResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: listingPrompt }]
            }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096
            }
          })
        });

        if (urlResponse.ok) {
          const urlData = await urlResponse.json();
          const urlText = urlData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
          
          try {
            const urlJson = JSON.parse(urlText.match(/\{[\s\S]*\}/)?.[0] || '{}');
            const truckUrls = urlJson.urls || [];
            
            console.log(`  ✓ Found ${truckUrls.length} truck URLs`);
            
            // Check for existing URLs to avoid duplicates
            for (const truckUrl of truckUrls.slice(0, 50)) { // Limit to 50 to avoid overload
              const { data: existing } = await supabase
                .from('scraping_jobs')
                .select('id')
                .eq('target_url', truckUrl)
                .limit(1);
              
              if (!existing || existing.length === 0) {
                await supabase
                  .from('scraping_jobs')
                  .insert({
                    target_url: truckUrl,
                    status: 'pending',
                    priority: job.priority + 1,
                    created_at: new Date().toISOString()
                  });
                console.log(`    + Added: ${truckUrl}`);
              }
            }
          } catch (e) {
            console.log('  ⚠️  Could not parse truck URLs');
          }
        }
        
        // Mark listing page as completed
        await supabase
          .from('scraping_jobs')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            data_collected: { is_listing: true }
          })
          .eq('id', job.id);
          
        continue; // Move to next job
      }

      // If we have a valid truck name, process it
      if (extractedData.name && extractedData.name !== 'Unknown' && extractedData.name.length >= 2) {
        console.log(`  ✓ Extracted: ${extractedData.name}`);
        
        // Check for existing truck
        const { data: existing } = await supabase
          .from('food_trucks')
          .select('id, name, source_urls')
          .ilike('name', `%${extractedData.name}%`)
          .limit(1);

        if (existing && existing.length > 0) {
          // Update existing
          const urls = Array.from(new Set([...(existing[0].source_urls || []), job.target_url]));
          await supabase
            .from('food_trucks')
            .update({
              ...extractedData,
              source_urls: urls,
              last_scraped_at: new Date().toISOString()
            })
            .eq('id', existing[0].id);
          console.log(`  ✓ Updated existing truck`);
        } else {
          // Create new
          await supabase
            .from('food_trucks')
            .insert({
              ...extractedData,
              source_urls: [job.target_url],
              last_scraped_at: new Date().toISOString(),
              data_quality_score: 0.7,
              verification_status: 'pending'
            });
          console.log(`  ✓ Created new truck`);
        }

        // Mark job completed
        await supabase
          .from('scraping_jobs')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            data_collected: extractedData
          })
          .eq('id', job.id);
      } else {
        throw new Error('Could not extract valid food truck data');
      }

    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}`);
      
      // Mark job failed
      await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'failed',
          errors: [error.message],
          updated_at: new Date().toISOString()
        })
        .eq('id', job.id);
    }

    // Small delay between jobs
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  const endTime = new Date();
  const duration = Math.round((endTime - startTime) / 1000);
  console.log(`\n✅ Batch completed in ${duration} seconds`);
  
  // Show stats
  const { data: stats } = await supabase
    .from('scraping_jobs')
    .select('status');
  
  const counts = stats?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {}) || {};

  console.log('\n📊 Job Status:');
  Object.entries(counts).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Show truck count
  const { count: truckCount } = await supabase
    .from('food_trucks')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n🚚 Total food trucks: ${truckCount}`);
}

// Run immediately, then schedule
processBatch().catch(console.error);

// Schedule to run every INTERVAL_MINUTES
setInterval(() => {
  processBatch().catch(console.error);
}, INTERVAL_MINUTES * 60 * 1000);

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Scraper stopped gracefully');
  process.exit(0);
});
