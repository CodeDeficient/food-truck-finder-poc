#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

// Test both local and remote configurations
const configs = {
  local: {
    url: 'http://127.0.0.1:54321',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU',
    name: 'Local Development'
  },
  remote: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    key: process.env.SUPABASE_SERVICE_ROLE_KEY,
    name: 'Production'
  }
};

async function testSchema(config) {
  console.log(`\n🔍 Testing ${config.name} Database Schema`);
  console.log('='.repeat(50));
  
  if (!config.url || !config.key) {
    console.log('❌ Missing configuration for', config.name);
    return false;
  }

  const supabase = createClient(config.url, config.key);

  try {
    // Test 1: Check if core tables exist
    console.log('\n📋 Checking core tables...');
    const coreTables = ['profiles', 'food_trucks', 'user_favorites', 'scraping_jobs', 'discovered_urls'];
    
    for (const table of coreTables) {
      try {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: OK`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }

    // Test 2: Check if favorite_trucks view exists
    console.log('\n👁️ Checking views...');
    try {
      const { data, error } = await supabase.from('favorite_trucks').select('*').limit(1);
      if (error) {
        console.log(`❌ View favorite_trucks: ${error.message}`);
      } else {
        console.log(`✅ View favorite_trucks: OK`);
      }
    } catch (err) {
      console.log(`❌ View favorite_trucks: ${err.message}`);
    }

    // Test 3: Check if owner_id column exists in food_trucks
    console.log('\n🔗 Checking schema columns...');
    try {
      const { data, error } = await supabase.from('food_trucks').select('owner_id').limit(1);
      if (error) {
        console.log(`❌ Column owner_id in food_trucks: ${error.message}`);
      } else {
        console.log(`✅ Column owner_id in food_trucks: OK`);
      }
    } catch (err) {
      console.log(`❌ Column owner_id in food_trucks: ${err.message}`);
    }

    // Test 4: Test basic insert/select/delete operations (cleanup after)
    console.log('\n🧪 Testing basic operations...');
    
    // Test food truck insert
    try {
      const { data: insertData, error: insertError } = await supabase
        .from('food_trucks')
        .insert({
          name: 'Test Truck Schema Validation',
          description: 'This is a test truck for schema validation',
          cuisine_type: ['test', 'validation'],
          verification_status: 'unverified'
        })
        .select()
        .single();

      if (insertError) {
        console.log(`❌ Insert test: ${insertError.message}`);
      } else {
        console.log(`✅ Insert test: OK (ID: ${insertData.id})`);
        
        // Clean up test data
        const { error: deleteError } = await supabase
          .from('food_trucks')
          .delete()
          .eq('id', insertData.id);
        
        if (!deleteError) {
          console.log(`✅ Cleanup test: OK`);
        } else {
          console.log(`⚠️ Cleanup test: ${deleteError.message}`);
        }
      }
    } catch (err) {
      console.log(`❌ Insert test: ${err.message}`);
    }

    console.log(`\n🎉 ${config.name} schema test completed!`);
    return true;

  } catch (error) {
    console.log(`❌ Connection error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🗄️ Database Schema Validation Test');
  console.log('===================================');
  
  // Test local first
  const localResult = await testSchema(configs.local);
  
  // Test remote if local passes
  if (localResult) {
    await testSchema(configs.remote);
  }
  
  console.log('\n✨ Schema validation complete!');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSchema };
