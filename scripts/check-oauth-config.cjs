#!/usr/bin/env node

/**
 * OAuth Configuration Checker
 * 
 * Checks common OAuth configuration issues
 */

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔐 OAuth Configuration Checker\n');

if (!supabaseUrl || !serviceRoleKey || !anonKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkOAuthConfig() {
  try {
    console.log('📊 Environment Check:');
    console.log(`  Supabase URL: ${supabaseUrl}`);
    console.log(`  Anon Key: ${anonKey.substring(0, 20)}...`);
    console.log(`  Service Key: ${serviceRoleKey.substring(0, 20)}...`);

    console.log('\n🔍 Common OAuth Issues to Check in Supabase Dashboard:\n');
    
    console.log('1. 🎯 Authentication > Providers > Google:');
    console.log('   - [ ] "Enable sign in with Google" toggle is ON');
    console.log('   - [ ] Client ID is entered correctly');
    console.log('   - [ ] Client Secret is entered correctly');
    console.log('   - [ ] Click "Save" after entering credentials\n');
    
    console.log('2. 🌐 Authentication > URL Configuration:');
    console.log('   - [ ] Site URL: https://food-truck-finder-poc.vercel.app');
    console.log('   - [ ] Redirect URLs includes:');
    console.log('         https://food-truck-finder-poc.vercel.app/auth/callback');
    console.log('         http://localhost:3000/auth/callback\n');
    
    console.log('3. 🔧 Google Cloud Console:');
    console.log('   - [ ] OAuth consent screen is configured');
    console.log('   - [ ] OAuth client has correct redirect URIs:');
    console.log('         https://zkwliyjjkdnigizidlln.supabase.co/auth/v1/callback');
    console.log('         https://food-truck-finder-poc.vercel.app/auth/callback');
    console.log('         http://localhost:3000/auth/callback\n');

    console.log('4. ⏱️ Common "Provider not enabled" fixes:');
    console.log('   - [ ] Wait 1-2 minutes after saving Supabase settings');
    console.log('   - [ ] Try disabling and re-enabling Google provider');
    console.log('   - [ ] Check that you clicked "Save" in Supabase');
    console.log('   - [ ] Refresh your browser and try again\n');

    // Test the Supabase client
    console.log('🧪 Testing Supabase Connection:');
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.log(`  ❌ Auth error: ${error.message}`);
      } else {
        console.log('  ✅ Supabase client connected successfully');
      }
    } catch (error) {
      console.log(`  ❌ Connection error: ${error.message}`);
    }

    // Check if we can query auth settings
    console.log('\n🔍 Trying to check auth configuration...');
    try {
      // This will give us insight into the auth config
      const { data: settings, error } = await supabase
        .from('auth.config')
        .select('*');
      
      if (error) {
        console.log('  ⚠️  Cannot query auth config (expected for security)');
      } else {
        console.log('  📋 Auth config accessible');
      }
    } catch (error) {
      console.log('  ⚠️  Cannot access auth config (this is normal)');
    }

    console.log('\n🎯 Most Likely Solutions:');
    console.log('1. In Supabase Dashboard > Authentication > Providers:');
    console.log('   - Make sure Google toggle is GREEN/ON');
    console.log('   - Click "Save" again after any changes');
    console.log('   - Wait 60 seconds and try again\n');
    
    console.log('2. If still failing, try this sequence:');
    console.log('   - Turn OFF Google provider');
    console.log('   - Save');
    console.log('   - Turn ON Google provider'); 
    console.log('   - Re-enter Client ID and Secret');
    console.log('   - Save');
    console.log('   - Wait 60 seconds and test\n');

    console.log('3. Check browser network tab:');
    console.log('   - Look for the OAuth request URL');
    console.log('   - Verify it includes the correct provider parameter');

  } catch (error) {
    console.error('💥 Configuration check failed:', error);
  }
}

// Also test the frontend client configuration
function checkFrontendConfig() {
  console.log('\n🎨 Frontend Configuration Check:');
  
  // Check if auth components are configured correctly
  const fs = require('fs');
  const path = require('path');
  
  try {
    const authModalPath = path.join(process.cwd(), 'components/auth/useAuthModal.ts');
    if (fs.existsSync(authModalPath)) {
      const content = fs.readFileSync(authModalPath, 'utf8');
      
      // Check for Google OAuth implementation
      if (content.includes('signInWithOAuth')) {
        console.log('  ✅ OAuth implementation found in useAuthModal.ts');
        
        // Check the provider parameter
        if (content.includes("provider: 'google'") || content.includes('provider,')) {
          console.log('  ✅ Google provider parameter configured');
        } else {
          console.log('  ⚠️  Check Google provider parameter in handleOAuthSignIn');
        }
      } else {
        console.log('  ❌ OAuth implementation not found');
      }
    }
  } catch (error) {
    console.log('  ⚠️  Could not check frontend auth configuration');
  }
}

// Run all checks
checkOAuthConfig().then(() => {
  checkFrontendConfig();
  console.log('\n✅ OAuth configuration check complete!');
  console.log('\n💡 Next steps:');
  console.log('1. Double-check Supabase Google provider is enabled and saved');
  console.log('2. Wait 60 seconds after making changes');
  console.log('3. Try the OAuth flow again');
  console.log('4. If still failing, disable/re-enable the provider');
}).catch(console.error);
