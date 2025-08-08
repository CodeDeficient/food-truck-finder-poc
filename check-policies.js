import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Checking existing RLS policies...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Service key present:', !!serviceRoleKey);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

// Create client with service role key (has admin permissions)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkPolicies() {
  try {
    console.log('\n🔒 Current RLS Policies for food_trucks table:');
    console.log('='.repeat(60));
    
    // Query existing policies for food_trucks table
    const { data: policies, error: policiesError } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
          FROM pg_policies 
          WHERE tablename = 'food_trucks' 
          ORDER BY policyname;
        `
      });

    if (policiesError) {
      console.log('⚠️  Cannot query policies directly, trying alternative method...');
      
      // Alternative: try to get policy info through information_schema
      const { data: altPolicies, error: altError } = await supabase
        .rpc('sql', {
          query: `
            SELECT 
              table_name,
              'Policy information not accessible' as policy_info
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'food_trucks';
          `
        });
      
      if (altError) {
        console.error('❌ Cannot access policy information:', altError);
      } else {
        console.log('📋 Table exists but policy details not accessible via this method');
      }
    } else {
      if (policies && policies.length > 0) {
        console.log(`Found ${policies.length} policies:`);
        policies.forEach((policy, index) => {
          console.log(`\n📜 Policy ${index + 1}:`);
          console.log(`   Name: ${policy.policyname}`);
          console.log(`   Roles: ${policy.roles}`);
          console.log(`   Operation: ${policy.cmd}`);
          console.log(`   Condition: ${policy.qual}`);
          console.log(`   With Check: ${policy.with_check || 'N/A'}`);
        });
      } else {
        console.log('📭 No policies found for food_trucks table');
      }
    }

    // Check if RLS is enabled
    console.log('\n🔐 RLS Status:');
    console.log('='.repeat(30));
    
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('sql', {
        query: `
          SELECT 
            schemaname,
            tablename,
            rowsecurity as rls_enabled,
            relforcerowsecurity as force_rls
          FROM pg_tables t
          JOIN pg_class c ON t.tablename = c.relname
          WHERE t.tablename = 'food_trucks' AND t.schemaname = 'public';
        `
      });

    if (rlsError) {
      console.error('❌ Cannot check RLS status:', rlsError);
    } else if (rlsStatus && rlsStatus.length > 0) {
      const status = rlsStatus[0];
      console.log(`RLS Enabled: ${status.rls_enabled}`);
      console.log(`Force RLS: ${status.force_rls}`);
    }

    // Test current access levels
    console.log('\n🧪 Testing Current Access:');
    console.log('='.repeat(35));
    
    // Test with service role (should work)
    const { data: serviceData, error: serviceError } = await supabase
      .from('food_trucks')
      .select('id, name, verification_status')
      .limit(3);
    
    console.log(`Service Role Access: ${serviceError ? '❌ BLOCKED' : '✅ ALLOWED'}`);
    if (serviceError) {
      console.log(`  Error: ${serviceError.message}`);
    } else {
      console.log(`  Found ${serviceData.length} records`);
    }

    // Test with anon key
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    const { data: anonData, error: anonError } = await anonClient
      .from('food_trucks')
      .select('id, name, verification_status')
      .limit(3);

    console.log(`Anonymous Access: ${anonError ? '❌ BLOCKED' : '✅ ALLOWED'}`);
    if (anonError) {
      console.log(`  Error: ${anonError.message}`);
    } else {
      console.log(`  Found ${anonData.length} records`);
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
  }
}

checkPolicies().then(() => {
  console.log('\n✅ Policy check complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
