#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const PRODUCTION_CONFIG = {
  url: 'https://zkwliyjjkdnigizidlln.supabase.co',
<<<<<<< HEAD
  key: ''
=======
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprd2xpeWpqa2RuaWdpemlkbGxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQxMzUxMiwiZXhwIjoyMDY3OTg5NTEyfQ.2A42eeadjgR-hF4NgTSE6R98t_mU5HDDY-4fg2hWNlM'
>>>>>>> data-specialist-2-work
};

// Individual SQL statements to execute
const MIGRATIONS = [
  {
    name: 'Add owner_id column',
    sql: 'ALTER TABLE food_trucks ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;'
  },
  {
    name: 'Create owner_id index',
    sql: 'CREATE INDEX IF NOT EXISTS idx_food_trucks_owner_id ON food_trucks(owner_id);'
  },
  {
    name: 'Add column comment',
    sql: "COMMENT ON COLUMN food_trucks.owner_id IS 'Reference to the user who owns this food truck (food_truck_owner role)';"
  }
];

// View creation as separate step
const VIEW_SQL = `
CREATE OR REPLACE VIEW favorite_trucks AS
SELECT 
  uf.id,
  uf.user_id,
  uf.truck_id,
  uf.created_at,
  uf.updated_at,
  ft.name,
  ft.cuisine_type,
  ft.current_location,
  ft.contact_info,
  ft.verification_status,
  ft.data_quality_score,
  ft.average_rating,
  ft.review_count
FROM user_favorites uf
JOIN food_trucks ft ON uf.truck_id = ft.id;
`;

async function executeMigrations() {
  console.log('🚀 Executing Production Database Migrations');
  console.log('===========================================\n');

  const supabase = createClient(PRODUCTION_CONFIG.url, PRODUCTION_CONFIG.key);

  try {
    // Test connection
    console.log('🔗 Testing connection...');
    const { data: testData, error: testError } = await supabase
      .from('food_trucks')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Connection failed:', testError.message);
      return;
    }
    console.log('✅ Connected to production database\n');

    // Execute basic migrations using raw SQL
    console.log('📝 Executing column migrations...');
    
    for (const migration of MIGRATIONS) {
      try {
        console.log(`  - ${migration.name}...`);
        
        // Use Supabase's raw SQL execution
        const { data, error } = await supabase
          .rpc('exec', { sql: migration.sql });
        
        if (error && !error.message.includes('already exists')) {
          console.log(`    ❌ Failed: ${error.message}`);
        } else {
          console.log(`    ✅ Success`);
        }
      } catch (err) {
        console.log(`    ⚠️  Skipped (${err.message})`);
      }
    }

    // Create view using a different method
    console.log('\n📝 Creating favorite_trucks view...');
    try {
      // First, try to drop the view if it exists
      await supabase.rpc('exec', { sql: 'DROP VIEW IF EXISTS favorite_trucks;' });
      
      // Then create the new view
      const { data, error } = await supabase.rpc('exec', { sql: VIEW_SQL });
      
      if (error) {
        console.log('❌ View creation failed:', error.message);
        console.log('\n📋 Manual SQL needed:');
        console.log(VIEW_SQL);
      } else {
        console.log('✅ View created successfully');
      }
    } catch (err) {
      console.log('⚠️ View creation needs manual execution:', err.message);
      console.log('\n📋 Manual SQL needed:');
      console.log(VIEW_SQL);
    }

    // Grant permissions
    console.log('\n📝 Setting permissions...');
    try {
      const { data, error } = await supabase
        .rpc('exec', { sql: 'GRANT SELECT ON favorite_trucks TO authenticated;' });
      
      if (error) {
        console.log('⚠️ Permission grant failed:', error.message);
      } else {
        console.log('✅ Permissions granted');
      }
    } catch (err) {
      console.log('⚠️ Permission setup needs manual execution');
    }

    console.log('\n🎉 Migration execution completed!');
    
    // Run validation test
    console.log('\n🔍 Running validation test...\n');
    const { testSchema } = require('./test-database-schema.cjs');
    await testSchema({
      url: PRODUCTION_CONFIG.url,
      key: PRODUCTION_CONFIG.key,
      name: 'Production (After Migration)'
    });

  } catch (error) {
    console.log('❌ Migration execution failed:', error.message);
    
    console.log('\n📋 If automatic execution failed, please run this SQL manually in Supabase Studio:');
    console.log('=' .repeat(70));
    
    const sqlContent = fs.readFileSync(path.join(__dirname, 'production-migration.sql'), 'utf8');
    console.log(sqlContent);
    
    console.log('=' .repeat(70));
  }
}

if (require.main === module) {
  executeMigrations().catch(console.error);
}

module.exports = { executeMigrations };
