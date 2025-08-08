import { chromium } from 'playwright';

async function captureConsoleAndDebug() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console messages
  const consoleMessages = [];
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    const timestamp = new Date().toISOString();
    
    consoleMessages.push({
      type,
      text,
      timestamp
    });
    
    console.log(`[${timestamp}] ${type.toUpperCase()}: ${text}`);
  });

  // Capture network requests
  page.on('request', request => {
    if (request.url().includes('supabase')) {
      console.log(`🌐 NETWORK REQUEST: ${request.method()} ${request.url()}`);
    }
  });

  // Capture network responses
  page.on('response', response => {
    if (response.url().includes('supabase')) {
      console.log(`📡 NETWORK RESPONSE: ${response.status()} ${response.url()}`);
    }
  });

  try {
    console.log('🚀 Navigating to localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    console.log('⏳ Waiting 5 seconds for app to load and execute...');
    await page.waitForTimeout(5000);

    console.log('\n📋 CONSOLE SUMMARY:');
    console.log('===================');
    
    const errors = consoleMessages.filter(msg => msg.type === 'error');
    const warnings = consoleMessages.filter(msg => msg.type === 'warning');
    const logs = consoleMessages.filter(msg => msg.type === 'log');
    
    console.log(`Errors: ${errors.length}`);
    console.log(`Warnings: ${warnings.length}`);
    console.log(`Logs: ${logs.length}`);
    
    if (errors.length > 0) {
      console.log('\n❌ ERRORS:');
      errors.forEach(msg => console.log(`  - ${msg.text}`));
    }
    
    if (warnings.length > 0) {
      console.log('\n⚠️ WARNINGS:');
      warnings.forEach(msg => console.log(`  - ${msg.text}`));
    }

    // Look for specific debug messages
    const supabaseMessages = consoleMessages.filter(msg => 
      msg.text.includes('Supabase') || 
      msg.text.includes('trucks') ||
      msg.text.includes('🔍') ||
      msg.text.includes('📦') ||
      msg.text.includes('🚛')
    );
    
    if (supabaseMessages.length > 0) {
      console.log('\n🔍 SUPABASE/TRUCKS MESSAGES:');
      supabaseMessages.forEach(msg => console.log(`  - ${msg.text}`));
    }

  } catch (error) {
    console.error('💥 Error during page load:', error);
  }

  await browser.close();
}

captureConsoleAndDebug().catch(console.error);
