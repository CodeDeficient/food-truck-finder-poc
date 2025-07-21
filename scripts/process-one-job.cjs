require('dotenv').config({ path: '.env.local' });

async function processOneJob() {
  console.log('=== Processing One Scraping Job ===\n');
  
  // Import modules
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get one pending job
  const { data: pendingJobs, error } = await supabase
    .from('scraping_jobs')
    .select('*')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .limit(1);

  if (error || !pendingJobs || pendingJobs.length === 0) {
    console.log('No pending jobs found.');
    
    // Show running jobs instead
    const { data: runningJobs } = await supabase
      .from('scraping_jobs')
      .select('id, target_url, created_at')
      .eq('status', 'running')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (runningJobs && runningJobs.length > 0) {
      console.log('\nRunning jobs (stuck):');
      runningJobs.forEach(job => {
        const age = Math.floor((Date.now() - new Date(job.created_at).getTime()) / (1000 * 60 * 60));
        console.log(`- ${job.target_url} (${age} hours old)`);
      });
      
      console.log('\nWould you like to reset these to pending? Run:');
      console.log('node scripts/reset-all-running-jobs.cjs');
    }
    return;
  }

  const job = pendingJobs[0];
  console.log(`Found job: ${job.id}`);
  console.log(`URL: ${job.target_url}`);
  console.log(`Priority: ${job.priority}`);

  // Update job to running
  await supabase
    .from('scraping_jobs')
    .update({ status: 'running', updated_at: new Date().toISOString() })
    .eq('id', job.id);

  try {
    // Step 1: Scrape with Firecrawl
    console.log('\n1️⃣ Scraping with Firecrawl...');
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
      throw new Error(`Firecrawl error: ${scrapeResponse.status} ${scrapeResponse.statusText}`);
    }

    const scrapeData = await scrapeResponse.json();
    console.log('✓ Scraped successfully');
    console.log(`- Content length: ${scrapeData.data?.markdown?.length || 0} characters`);

    // Step 2: Extract with Gemini
    console.log('\n2️⃣ Extracting data with Gemini...');
    const extractPrompt = `Extract food truck information from this website content.
    
Website URL: ${job.target_url}
Content:
${scrapeData.data?.markdown?.substring(0, 10000)}

Return a JSON object with these fields:
- name: string (food truck name)
- description: string (brief description)
- cuisine_type: string[] (types of food served)
- price_range: string ($ or $$ or $$$ or $$$$)
- specialties: string[] (signature dishes)
- contact_info: { phone?: string, email?: string, website?: string }
- social_media: { instagram?: string, facebook?: string, twitter?: string }
- current_location: { address?: string, city?: string, state?: string }

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
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini error: ${geminiResponse.status} - ${errorText}`);
    }

    const geminiData = await geminiResponse.json();
    const extractedText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Clean and parse JSON with better error handling
    let extractedData = {};
    try {
      // First try to find JSON in the text
      const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        // Clean up common JSON issues
        let cleanJson = jsonMatch[0]
          .replace(/,\s*}/g, '}') // Remove trailing commas
          .replace(/,\s*]/g, ']') // Remove trailing commas in arrays
          .replace(/\n/g, ' ') // Replace newlines with spaces
          .replace(/\s+/g, ' '); // Normalize whitespace
        
        extractedData = JSON.parse(cleanJson);
      }
    } catch (parseError) {
      console.log('⚠️  JSON parsing error, trying to extract manually...');
      // Try to extract key fields manually if JSON parsing fails
      const nameMatch = extractedText.match(/"name"\s*:\s*"([^"]+)"/i);
      const cuisineMatch = extractedText.match(/"cuisine_type"\s*:\s*\[([^\]]+)\]/i);
      
      extractedData = {
        name: nameMatch ? nameMatch[1] : 'Unknown',
        cuisine_type: cuisineMatch ? cuisineMatch[1].split(',').map(s => s.trim().replace(/"/g, '')) : [],
        description: 'Extracted from ' + job.target_url
      };
    }
    
    console.log('✓ Extracted data:');
    console.log(`- Name: ${extractedData.name || 'Unknown'}`);
    console.log(`- Cuisine: ${extractedData.cuisine_type?.join(', ') || 'Unknown'}`);
    
    // Validate extracted data
    if (!extractedData.name || extractedData.name === 'Unknown' || extractedData.name.length < 2) {
      throw new Error('Failed to extract valid food truck name from page - might be a listing page or invalid content');
    }

    // Step 3: Save to database
    console.log('\n3️⃣ Saving to database...');
    
    // Check if truck already exists - better duplicate detection
    // First check by name similarity
    const { data: existingByName } = await supabase
      .from('food_trucks')
      .select('id, name, source_urls')
      .ilike('name', `%${extractedData.name}%`);
    
    // Also check by URL
    const { data: existingByUrl } = await supabase
      .from('food_trucks')
      .select('id, name, source_urls')
      .contains('source_urls', [job.target_url]);
    
    // Combine results and take first match
    const existingTrucks = [...(existingByName || []), ...(existingByUrl || [])];
    const uniqueTrucks = existingTrucks.filter((truck, index, self) => 
      index === self.findIndex(t => t.id === truck.id)
    );

    let truckId;
    if (uniqueTrucks && uniqueTrucks.length > 0) {
      console.log(`Found existing truck: ${uniqueTrucks[0].name}`);
      truckId = uniqueTrucks[0].id;
      
      // Update existing truck - merge source URLs
      const existingUrls = uniqueTrucks[0].source_urls || [];
      const newUrls = Array.from(new Set([...existingUrls, job.target_url]));
      
      await supabase
        .from('food_trucks')
        .update({
          ...extractedData,
          source_urls: newUrls,
          last_scraped_at: new Date().toISOString(),
          data_quality_score: 0.7
        })
        .eq('id', truckId);
      
      console.log(`✓ Updated existing truck with new data`);
      console.log(`- Source URLs: ${newUrls.length} total`);
    } else {
      // Create new truck
      const { data: newTruck, error: createError } = await supabase
        .from('food_trucks')
        .insert({
          ...extractedData,
          source_urls: [job.target_url],
          last_scraped_at: new Date().toISOString(),
          data_quality_score: 0.7,
          verification_status: 'pending'
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Failed to create truck: ${createError.message}`);
      }
      
      truckId = newTruck.id;
      console.log(`✓ Created new truck: ${newTruck.name}`);
    }

    // Update job to completed
    await supabase
      .from('scraping_jobs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
        data_collected: extractedData
      })
      .eq('id', job.id);

    console.log('\n✅ Job completed successfully!');

    // Show stats
    const { count: truckCount } = await supabase
      .from('food_trucks')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 Total food trucks now: ${truckCount}`);

  } catch (error) {
    console.error('\n❌ Job failed:', error.message);
    
    // Update job to failed
    await supabase
      .from('scraping_jobs')
      .update({ 
        status: 'failed',
        errors: [error.message],
        updated_at: new Date().toISOString()
      })
      .eq('id', job.id);
  }
}

processOneJob().catch(console.error);
