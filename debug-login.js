const { chromium } = require('playwright');

async function debugLogin() {
  console.log('🔍 Starting login page debug with Playwright...\n');
  
  const browser = await chromium.launch({ 
    headless: false, // Show browser for debugging
    devtools: true   // Open dev tools
  });
  
  const page = await browser.newPage();
  
  // Listen to console logs
  page.on('console', msg => {
    console.log(`🖥️  BROWSER: ${msg.type()}: ${msg.text()}`);
  });
  
  // Listen to page errors
  page.on('pageerror', error => {
    console.log(`❌ PAGE ERROR: ${error.message}`);
    console.log(`   Stack: ${error.stack}`);
  });
  
  // Listen to network requests
  page.on('request', request => {
    if (request.url().includes('auth') || request.url().includes('supabase')) {
      console.log(`🌐 REQUEST: ${request.method()} ${request.url()}`);
    }
  });
  
  // Listen to network responses
  page.on('response', response => {
    if (response.url().includes('auth') || response.url().includes('supabase')) {
      console.log(`📡 RESPONSE: ${response.status()} ${response.url()}`);
    }
  });
  
  try {
    console.log('📊 Navigating to login page...');
    await page.goto('http://localhost:3000/login', { 
      waitUntil: 'domcontentloaded',
      timeout: 10000 
    });
    
    // Wait a moment for any hydration to complete
    await page.waitForTimeout(2000);
    
    console.log('🔍 Checking page content...');
    const title = await page.title();
    console.log(`   Page title: ${title}`);
    
    // Check if error is visible on page
    const errorElement = await page.locator('text=Cannot read properties of null').first();
    const hasError = await errorElement.count() > 0;
    
    if (hasError) {
      console.log('❌ Found error on page');
      const errorText = await errorElement.textContent();
      console.log(`   Error text: ${errorText}`);
    } else {
      console.log('✅ No visible error on page');
    }
    
    // Check if Google button exists and is clickable
    const googleButton = page.locator('button', { hasText: 'Google' });
    const googleButtonExists = await googleButton.count() > 0;
    
    console.log(`🔘 Google button exists: ${googleButtonExists}`);
    
    if (googleButtonExists) {
      console.log('🖱️  Attempting to click Google button...');
      
      // Wait for button to be ready
      await googleButton.waitFor({ state: 'visible' });
      
      try {
        await googleButton.click();
        console.log('✅ Google button clicked successfully');
        
        // Wait to see what happens
        await page.waitForTimeout(3000);
        
        const currentUrl = page.url();
        console.log(`📍 Current URL after click: ${currentUrl}`);
        
      } catch (clickError) {
        console.log(`❌ Error clicking Google button: ${clickError.message}`);
      }
    }
    
    // Capture any additional console logs
    await page.waitForTimeout(2000);
    
  } catch (error) {
    console.log(`💥 Navigation or interaction error: ${error.message}`);
  }
  
  console.log('\n🔍 Debug session complete. Browser will stay open for 10 seconds...');
  await page.waitForTimeout(10000);
  
  await browser.close();
}

debugLogin().catch(console.error);
