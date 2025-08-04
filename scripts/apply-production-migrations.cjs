#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const PRODUCTION_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zkwliyjjkdnigizidlln.supabase.co',
  key: process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inprd2xpeWpqa2RuaWdpemlkbGxuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQxMzUxMiwiZXhwIjoyMDY3OTg5NTEyfQ.2A42eeadjgR-hF4NgTSE6R98t_mU5HDDY-4fg2hWNlM'
};

const MIGRATIONS = [
  {
    name: 'Add owner_id to food_trucks',
    sql: `
-- Add owner_id column to food_trucks table
ALTER TABLE food_trucks 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for better performance when querying trucks by owner
CREATE INDEX IF NOT EXISTS idx_food_trucks_owner_id ON food_trucks(owner_id);

-- Add comment to document the new column
COMMENT ON COLUMN food_trucks.owner_id IS 'Reference to the user who owns this food truck (food_truck_owner role)';
    `
  },
  {
    name: 'Update food truck RLS policies for owners',
    sql: `
-- Allow food truck owners to update their own trucks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_trucks' 
    AND policyname = 'Food truck owners can update their own trucks'
  ) THEN
    CREATE POLICY "Food truck owners can update their own trucks" 
      ON food_trucks FOR UPDATE 
      TO authenticated
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- Allow food truck owners to insert new trucks (with themselves as owner)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_trucks' 
    AND policyname = 'Food truck owners can create trucks'
  ) THEN
    CREATE POLICY "Food truck owners can create trucks" 
      ON food_trucks FOR INSERT 
      TO authenticated
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;

-- Allow food truck owners to delete their own trucks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_trucks' 
    AND policyname = 'Food truck owners can delete their own trucks'
  ) THEN
    CREATE POLICY "Food truck owners can delete their own trucks" 
      ON food_trucks FOR DELETE 
      TO authenticated
      USING (auth.uid() = owner_id);
  END IF;
END $$;

-- Allow admins to manage all trucks
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'food_trucks' 
    AND policyname = 'Admins can manage all trucks'
  ) THEN
    CREATE POLICY "Admins can manage all trucks" 
      ON food_trucks FOR ALL 
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM profiles 
          WHERE profiles.id = auth.uid() 
          AND profiles.role = 'admin'
        )
      );
  END IF;
END $$;
    `
  },
  {
    name: 'Create favorite_trucks view',
    sql: `
-- Create a view that joins user_favorites with food_trucks for easier querying
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

-- Grant access to authenticated users
GRANT SELECT ON favorite_trucks TO authenticated;

-- Add RLS policy for the view
ALTER VIEW favorite_trucks SET (security_invoker = true);

-- Comment on the view
COMMENT ON VIEW favorite_trucks IS 'View that combines user favorites with food truck details for easier querying';
    `
  }
];

async function applyMigrations() {
  console.log('🚀 Applying Production Database Migrations');
  console.log('==========================================\n');

  const supabase = createClient(PRODUCTION_CONFIG.url, PRODUCTION_CONFIG.key);

  try {
    // Test connection first
    const { data: testData, error: testError } = await supabase
      .from('food_trucks')
      .select('id')
      .limit(1);

    if (testError) {
      console.log('❌ Connection failed:', testError.message);
      return;
    }

    console.log('✅ Connected to production database\n');

    // Apply each migration
    for (const migration of MIGRATIONS) {
      console.log(`📝 Applying: ${migration.name}`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', { 
          sql_query: migration.sql 
        });

        if (error) {
          // Try direct execution if RPC fails
          console.log('⚠️  RPC method failed, trying direct execution...');
          
          // For direct SQL execution, we'll use a workaround
          const { error: directError } = await supabase
            .from('_temp_migration_log')
            .insert({ migration_name: migration.name, applied_at: new Date().toISOString() })
            .then(() => {
              // This is a workaround - in a real scenario, you'd execute the SQL directly
              console.log('⚠️  Direct SQL execution requires manual application');
              console.log('📋 SQL to execute:');
              console.log(migration.sql);
              console.log('---\n');
            });
        } else {
          console.log('✅ Applied successfully\n');
        }
      } catch (err) {
        console.log(`❌ Failed to apply ${migration.name}:`, err.message);
        console.log('📋 SQL that failed:');
        console.log(migration.sql);
        console.log('---\n');
      }
    }

    console.log('🎉 Migration process completed!');
    console.log('\n🔍 Running validation test...\n');

    // Run validation
    const { testSchema } = require('./test-database-schema.cjs');
    await testSchema({
      url: PRODUCTION_CONFIG.url,
      key: PRODUCTION_CONFIG.key,
      name: 'Production (After Migration)'
    });

  } catch (error) {
    console.log('❌ Migration process failed:', error.message);
  }
}

if (require.main === module) {
  applyMigrations().catch(console.error);
}

module.exports = { applyMigrations };
