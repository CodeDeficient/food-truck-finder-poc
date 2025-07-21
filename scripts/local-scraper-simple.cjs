require('dotenv').config({ path: '.env.local' });

const BATCH_SIZE = 5; // Process 5 jobs at a time
const INTERVAL_MINUTES = 5; // Run every 5 minutes

// Geocoding function - adapted from lib/utils/geocoding.ts
async function geocodeAddress(address, city = 'Charleston, SC') {
  try {
    const cleanAddress = address.trim();
    if (!cleanAddress) {
      throw new Error('Empty address provided');
    }

    // Construct search query - add city if not already in address
    const searchQuery = cleanAddress.toLowerCase().includes('charleston') 
      ? cleanAddress 
      : `${cleanAddress}, ${city}`;

    // Use Nominatim API
    const url = new URL('https://nominatim.openstreetmap.org/search');
    url.searchParams.set('q', searchQuery);
    url.searchParams.set('format', 'json');
    url.searchParams.set('limit', '1');
    url.searchParams.set('countrycodes', 'us');
    url.searchParams.set('addressdetails', '1');

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'FoodTruckFinder/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return { success: false };
    }

    const result = data[0];
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates returned');
    }

    return {
      lat,
      lng,
      formatted_address: result.display_name,
      success: true,
    };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    return { success: false };
  }
}

// Helper function to extract potential addresses from text
function extractAddresses(text) {
  const addresses = [];
  
  // Common address patterns
  const patterns = [
    // Street addresses with numbers
    /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Circle|Cir|Plaza|Place|Pl)\b[^,]*,\s*[A-Za-z\s]+,\s*(?:SC|South Carolina)/gi,
    // Street addresses without state
    /\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Circle|Cir|Plaza|Place|Pl)\b[^,]*,\s*Charleston/gi,
    // General location descriptions
    /(?:located at|address:|find us at|visit us at)\s*:?\s*([^.\n]+(?:Charleston|SC|South Carolina)[^.\n]*)/gi,
    // Specific Charleston landmarks
    /(?:Marion Square|King Street|Market Street|Meeting Street|East Bay Street|Folly Beach|Sullivan's Island|Mount Pleasant|West Ashley|James Island|Johns Island|Daniel Island|North Charleston)[^.\n]*/gi
  ];
  
  patterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      const address = match[1] || match[0];
      // Clean up the address
      const cleaned = address
        .replace(/[\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Filter out generic or invalid addresses
      if (cleaned.length > 10 && 
          cleaned.length < 200 && 
          !cleaned.toLowerCase().includes('click here') &&
          !cleaned.toLowerCase().includes('see map') &&
          !cleaned.toLowerCase().includes('various locations')) {
        addresses.push(cleaned);
      }
    }
  });
  
  // Remove duplicates
  return [...new Set(addresses)];
}

console.log('=== Simple Local Scraper Started ===');
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

    let scrapeData = null;
    let extractedData = {};
    
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

      scrapeData = await scrapeResponse.json();
      console.log(`  ✓ Scraped (${scrapeData.data?.markdown?.length || 0} chars)`);

      // Extract with Gemini
      const extractPrompt = `Analyze this website content to determine if it's:
1. A specific food truck's website/page
2. A listing page with multiple food trucks
3. Something else
      
Website URL: ${job.target_url}
Content:
${scrapeData.data?.markdown?.substring(0, 15000)}

If this is a SPECIFIC food truck's website or page:
- Extract detailed information about that food truck
- Return a JSON object with name, description, cuisine_type, etc.

If this is a LISTING page with multiple food trucks:
- Return: {"type": "listing", "food_trucks": ["Truck Name 1", "Truck Name 2", ...]}
- Include all food truck names you can find

If it's neither:
- Return: {"type": "other", "name": "Unknown"}

For a specific food truck, return JSON with these fields:
- name: string (food truck name)
- description: string (brief description)
- cuisine_type: string[] (types of food served)
- price_range: string ($ or $$ or $$$ or $$$$)
- specialties: string[] (signature dishes)
- contact_info: { phone?: string, email?: string, website?: string }
- social_media: { instagram?: string, facebook?: string, twitter?: string }
- current_location: { address?: string, city?: string, state?: string }
- possible_addresses: string[] (any specific addresses or locations mentioned)

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

      console.log(`  ✓ Extracted: ${extractedData.name || extractedData.type || 'Unknown'}`);
      
      // Handle listing page response from Gemini
      if (extractedData.type === 'listing' && extractedData.food_trucks) {
        console.log(`  ✓ Gemini identified listing page with ${extractedData.food_trucks.length} trucks`);
        
        // Create food truck entries for each found truck
        for (const truckName of extractedData.food_trucks) {
          if (truckName && truckName.length > 2) {
            // Check if truck already exists
            const { data: existing } = await supabase
              .from('food_trucks')
              .select('id')
              .ilike('name', `%${truckName}%`)
              .single();
            
            if (!existing) {
              // Try to extract addresses from the page content for this truck
              const potentialAddresses = extractAddresses(scrapeData.data?.markdown || '');
              let location = {
                state: 'SC',
                city: 'Charleston'
              };
              
              // Try to geocode any addresses found
              if (potentialAddresses.length > 0) {
                console.log(`    🔍 Found ${potentialAddresses.length} potential addresses, trying to geocode...`);
                for (const addr of potentialAddresses) {
                  try {
                    const geocodeResult = await geocodeAddress(addr, 'Charleston, SC');
                    if (geocodeResult.success) {
                      location = {
                        ...location,
                        address: addr,
                        lat: geocodeResult.lat,
                        lng: geocodeResult.lng
                      };
                      console.log(`    📍 Geocoded successfully: ${addr}`);
                      break; // Use first successful geocoding
                    }
                  } catch (e) {
                    console.log(`    ⚠️ Geocoding failed for: ${addr}`);
                  }
                }
              }
              
              // Only use fallback if no address was geocoded
              if (!location.lat || !location.lng) {
                location.address = 'Charleston, SC (exact location pending)';
                location.lat = 32.7765;
                location.lng = -79.9311;
              }
              
              await supabase
                .from('food_trucks')
                .insert({
                  name: truckName,
                  source_urls: [job.target_url],
                  last_scraped_at: new Date().toISOString(),
                  data_quality_score: location.address && location.address !== 'Charleston, SC (exact location pending)' ? 0.6 : 0.5,
                  verification_status: 'pending',
                  description: 'Food truck found in listing',
                  current_location: location
                });
              console.log(`    + Created truck: ${truckName}`);
            }
          }
        }
        
        // Mark job as completed
        await supabase
          .from('scraping_jobs')
          .update({ 
            status: 'completed',
            completed_at: new Date().toISOString(),
            data_collected: { type: 'listing', trucks_found: extractedData.food_trucks.length }
          })
          .eq('id', job.id);
          
        continue; // Skip the rest of the processing
      }

    // If still no valid truck, treat as listing page
    // Only extract URLs that likely point to food truck pages
    const allUrls = scrapeData.data?.markdown?.match(/https?:\/\/[\w.-]+\/[^ '"\n<>]+/g) || [];
    
    // Filter for URLs that likely represent food truck pages
    const truckUrls = allUrls.filter(url => {
      // Skip common non-truck URLs
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
          url.includes('/about') || url.includes('/privacy')) {
        return false;
      }
      
      // Look for URLs that might be individual food truck pages
      return url.includes('/food-truck') || url.includes('/foodtruck') ||
             url.includes('/member/') || url.includes('/restaurants/') ||
             url.includes('/trucks/') || url.includes('-food-truck') ||
             url.includes('-foodtruck') || url.includes('/vendor/');
    });

    if (truckUrls.length > 0) {
      console.log(`  ✓ Found listing page with ${truckUrls.length} truck URLs`);
      
      // Add found URLs to the queue
      for (const truckUrl of truckUrls) {
        await supabase
          .from('scraping_jobs')
          .insert({
            target_url: truckUrl,
            status: 'pending',
            priority: job.priority + 1, // Set higher priority for individual trucks
            created_at: new Date().toISOString()
          });
        console.log(`    - Added to queue: ${truckUrl}`);
      }
      
      // Mark listing page job as completed
      await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString(),
          data_collected: { type: 'listing', urls_found: truckUrls.length }
        })
        .eq('id', job.id);

      continue;
    }

    // Validate extracted truck name
    if (!extractedData.name || extractedData.name === 'Unknown' || extractedData.name.length < 2) {
      throw new Error('Invalid food truck name after checking against listings');
    }

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
        // Create new truck
        let finalData = { ...extractedData };
        
        // If we have address info but no coordinates, try to geocode
        if (extractedData.current_location?.address && 
            (!extractedData.current_location.lat || !extractedData.current_location.lng)) {
          console.log(`  🔍 Geocoding address: ${extractedData.current_location.address}`);
          try {
            const geocodeResult = await geocodeAddress(
              extractedData.current_location.address, 
              extractedData.current_location.city || 'Charleston, SC'
            );
            if (geocodeResult.success) {
              finalData.current_location = {
                ...extractedData.current_location,
                lat: geocodeResult.lat,
                lng: geocodeResult.lng
              };
              console.log(`  📍 Geocoded successfully`);
            }
          } catch (e) {
            console.log(`  ⚠️ Geocoding failed, using address only`);
          }
        }
        
        // If still no valid location, check possible_addresses
        if (!finalData.current_location?.lat && extractedData.possible_addresses?.length > 0) {
          console.log(`  🔍 Trying ${extractedData.possible_addresses.length} possible addresses...`);
          for (const addr of extractedData.possible_addresses) {
            try {
              const geocodeResult = await geocodeAddress(addr, 'Charleston, SC');
              if (geocodeResult.success) {
                finalData.current_location = {
                  address: addr,
                  city: 'Charleston',
                  state: 'SC',
                  lat: geocodeResult.lat,
                  lng: geocodeResult.lng
                };
                console.log(`  📍 Geocoded from possible addresses: ${addr}`);
                break;
              }
            } catch (e) {
              continue;
            }
          }
        }
        
        // Remove possible_addresses from final data
        delete finalData.possible_addresses;
        
        await supabase
          .from('food_trucks')
          .insert({
            ...finalData,
            source_urls: [job.target_url],
            last_scraped_at: new Date().toISOString(),
            data_quality_score: finalData.current_location?.lat ? 0.8 : 0.6,
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
