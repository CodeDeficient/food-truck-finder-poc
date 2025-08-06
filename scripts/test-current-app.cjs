#!/usr/bin/env node

/**
 * Quick Application Test Script
 * 
 * Tests the current state of the food truck finder application
 */

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function testApplication() {
  console.log('🧪 Testing Food Truck Finder Application...\n');

  const results = {
    database: { passed: 0, total: 0 },
    auth: { passed: 0, total: 0 },
    features: { passed: 0, total: 0 }
  };

  try {
    // ============================================================================
    // Database Tests
    // ============================================================================
    console.log('📊 Database Tests:');

    // Test 1: Food trucks data
    results.database.total++;
    try {
      const { data: trucks, error } = await supabase
        .from('food_trucks')
        .select('id, name, current_location')
        .limit(5);

      if (error) throw error;
      console.log(`  ✅ Food trucks query: ${trucks.length} trucks found`);
      results.database.passed++;
    } catch (error) {
      console.log(`  ❌ Food trucks query failed: ${error.message}`);
    }

    // Test 2: Profiles table
    results.database.total++;
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, role')
        .limit(3);

      if (error) throw error;
      console.log(`  ✅ Profiles query: ${profiles.length} profiles found`);
      results.database.passed++;
    } catch (error) {
      console.log(`  ❌ Profiles query failed: ${error.message}`);
    }

    // Test 3: Check for dashboard dependencies
    results.database.total++;
    try {
      // Check if owner_id column exists
      const { data: columns, error } = await supabase
        .rpc('execute_sql', {
          sql: `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'food_trucks' 
            AND column_name = 'owner_id'
          `
        });

      if (error) throw error;
      
      if (columns && columns.length > 0) {
        console.log('  ✅ Dashboard dependencies: owner_id column exists');
        results.database.passed++;
      } else {
        console.log('  ⚠️  Dashboard dependencies: owner_id column missing (needs migration)');
      }
    } catch (error) {
      console.log(`  ❌ Dashboard dependencies check failed: ${error.message}`);
    }

    // ============================================================================
    // Auth Configuration Tests  
    // ============================================================================
    console.log('\n🔐 Authentication Tests:');

    // Test 4: Supabase client initialization
    results.auth.total++;
    try {
      const { data, error } = await supabase.auth.getSession();
      console.log('  ✅ Supabase client: Initialized successfully');
      results.auth.passed++;
    } catch (error) {
      console.log(`  ❌ Supabase client failed: ${error.message}`);
    }

    // Test 5: Environment variables
    results.auth.total++;
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length === 0) {
      console.log('  ✅ Environment variables: All required vars present');
      results.auth.passed++;
    } else {
      console.log(`  ❌ Environment variables: Missing ${missingEnvVars.join(', ')}`);
    }

    // ============================================================================
    // Feature Tests
    // ============================================================================
    console.log('\n🎯 Feature Tests:');

    // Test 6: Food truck icon
    results.features.total++;
    const fs = require('fs');
    const path = require('path');
    const iconPath = path.join(process.cwd(), 'public', 'food-truck-icon.svg');
    
    if (fs.existsSync(iconPath)) {
      console.log('  ✅ Map icons: food-truck-icon.svg exists');
      results.features.passed++;
    } else {
      console.log('  ❌ Map icons: food-truck-icon.svg missing');
    }

    // Test 7: Critical components exist
    results.features.total++;
    const criticalComponents = [
      'components/map/MapComponent.tsx',
      'components/auth/AuthModal.tsx',
      'app/user-dashboard/page.tsx',
      'app/owner-dashboard/page.tsx'
    ];

    let componentsExist = 0;
    criticalComponents.forEach(componentPath => {
      const fullPath = path.join(process.cwd(), componentPath);
      if (fs.existsSync(fullPath)) {
        componentsExist++;
      }
    });

    if (componentsExist === criticalComponents.length) {
      console.log('  ✅ Critical components: All components exist');
      results.features.passed++;
    } else {
      console.log(`  ⚠️  Critical components: ${componentsExist}/${criticalComponents.length} components found`);
    }

    // ============================================================================
    // Results Summary
    // ============================================================================
    console.log('\n📋 Test Results Summary:');
    console.log(`  Database: ${results.database.passed}/${results.database.total} tests passed`);
    console.log(`  Auth: ${results.auth.passed}/${results.auth.total} tests passed`);
    console.log(`  Features: ${results.features.passed}/${results.features.total} tests passed`);

    const totalPassed = results.database.passed + results.auth.passed + results.features.passed;
    const totalTests = results.database.total + results.auth.total + results.features.total;
    const passRate = ((totalPassed / totalTests) * 100).toFixed(1);

    console.log(`\n🎯 Overall: ${totalPassed}/${totalTests} tests passed (${passRate}%)`);

    // ============================================================================
    // Recommendations
    // ============================================================================
    console.log('\n💡 Recommendations:');

    if (results.database.passed < results.database.total) {
      console.log('  🔧 Run database migration: scripts/fix-dashboard-dependencies.sql');
    }

    if (results.auth.passed < results.auth.total) {
      console.log('  🔐 Configure Google OAuth in Google Cloud Console + Supabase');
    }

    if (passRate >= 80) {
      console.log('  🚀 Application is ready for OAuth setup and testing!');
    } else {
      console.log('  ⚠️  Fix critical issues before proceeding with OAuth setup');
    }

    console.log('\n📚 Next Steps:');
    console.log('  1. Follow docs/FOCUSED_LAUNCH_PLAN.md');
    console.log('  2. Set up Google OAuth (30 minutes)');
    console.log('  3. Run database migration if needed');
    console.log('  4. Test authentication flow');

  } catch (error) {
    console.error('💥 Test suite failed:', error);
  }
}

// Run the tests
testApplication().then(() => {
  console.log('\n✅ Application testing complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal testing error:', error);
  process.exit(1);
});
