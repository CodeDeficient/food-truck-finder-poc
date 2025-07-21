require('dotenv').config({ path: '.env.local' });

async function testScrape() {
  console.log('=== Testing Scraping System ===\n');
  
  // Check environment variables
  console.log('Environment Check:');
  console.log('- SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing');
  console.log('- SUPABASE_SERVICE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✓ Set' : '✗ Missing');
  console.log('- FIRECRAWL_API_KEY:', process.env.FIRECRAWL_API_KEY ? '✓ Set' : '✗ Missing');
  console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✓ Set' : '✗ Missing');
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('\n❌ Missing required environment variables!');
    return;
  }

  // Import after env vars are loaded
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Check database connection
  console.log('\n📊 Database Status:');
  const { count: truckCount } = await supabase
    .from('food_trucks')
    .select('*', { count: 'exact', head: true });
  
  console.log(`- Total food trucks: ${truckCount}`);
  
  const { data: jobStats } = await supabase
    .from('scraping_jobs')
    .select('status');
  
  const stats = jobStats?.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1;
    return acc;
  }, {}) || {};

  console.log('- Job status:');
  Object.entries(stats).forEach(([status, count]) => {
    console.log(`  ${status}: ${count}`);
  });

  // Try a simple API call to test if Firecrawl works
  console.log('\n🔥 Testing Firecrawl API:');
  try {
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: 'https://example.com',
        formats: ['markdown']
      })
    });
    
    if (response.ok) {
      console.log('✓ Firecrawl API is accessible');
    } else {
      console.log('✗ Firecrawl API error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('✗ Firecrawl API connection failed:', error.message);
  }

  // Test Gemini API
  console.log('\n🤖 Testing Gemini API:');
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Say 'API test successful' and nothing else"
          }]
        }]
      })
    });
    
    if (response.ok) {
      console.log('✓ Gemini API is accessible');
    } else {
      console.log('✗ Gemini API error:', response.status, response.statusText);
    }
  } catch (error) {
    console.log('✗ Gemini API connection failed:', error.message);
  }

  console.log('\n✅ Test complete!');
}

testScrape().catch(console.error);
