import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Executing SQL to add public policies...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Service key present:', !!serviceRoleKey);

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials! Need both URL and SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create client with service role key (has admin permissions)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSQLPolicies() {
  try {
    console.log('📂 Reading SQL policy definitions...');
    
    // Define the policies directly in the script
    const policies = [
      {
        name: 'Public users can view food_trucks',
        sql: `
          CREATE POLICY "Public users can view food_trucks" 
          ON public.food_trucks 
          FOR SELECT 
          TO anon 
          USING (
              verification_status IN ('verified', 'pending')
          );
        `
      },
      {
        name: 'Authenticated users can view food_trucks',
        sql: `
          CREATE POLICY "Authenticated users can view food_trucks" 
          ON public.food_trucks 
          FOR SELECT 
          TO authenticated 
          USING (
              verification_status IN ('verified', 'pending')
          );
        `
      }
    ];

    console.log(`\n🏗️  Creating ${policies.length} RLS policies...`);

    // Execute each policy
    for (const policy of policies) {
      console.log(`\n📜 Creating policy: ${policy.name}`);
      
      try {
        // Use a direct database connection approach
        const { data, error } = await supabase.rpc('exec', {
          sql: policy.sql
        });

        if (error) {
          // If the RPC doesn't exist, try a different approach
          console.log('   💡 Trying alternative execution method...');
          
          // Method 2: Try using a simple function call that might exist
          const { data: data2, error: error2 } = await supabase
            .rpc('sql', { query: policy.sql });

          if (error2) {
            console.log(`   ⚠️  Could not execute via RPC: ${error2.message}`);
            console.log('   📋 Policy SQL that needs manual execution:');
            console.log(`   ${policy.sql.trim()}`);
          } else {
            console.log('   ✅ Policy created successfully!');
          }
        } else {
          console.log('   ✅ Policy created successfully!');
        }
      } catch (execError) {
        console.log(`   ⚠️  Execution failed: ${execError.message}`);
        console.log('   📋 Policy SQL that needs manual execution:');
        console.log(`   ${policy.sql.trim()}`);
      }
    }

    // Test the policies by checking anonymous access
    console.log('\n🧪 Testing anonymous access after policy creation...');
    
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: testData, error: testError } = await anonClient
      .from('food_trucks')
      .select('id, name, verification_status')
      .limit(5);

    if (testError) {
      console.log('❌ Anonymous access still blocked:', testError.message);
      console.log('\n💡 MANUAL EXECUTION REQUIRED:');
      console.log('Copy and paste these SQL statements in your Supabase SQL editor:');
      console.log('='.repeat(60));
      
      policies.forEach(policy => {
        console.log(policy.sql.trim());
        console.log('');
      });
      
    } else {
      console.log('✅ Anonymous access now works!');
      console.log(`📊 Found ${testData.length} food trucks accessible to anonymous users`);
      
      if (testData.length > 0) {
        console.log('\n🚛 Sample food trucks:');
        testData.forEach((truck, index) => {
          console.log(`   ${index + 1}. ${truck.name} (${truck.verification_status})`);
        });
      }
      
      console.log('\n🎉 SUCCESS! Your app should now display food trucks!');
      console.log('🔄 Refresh your localhost:3000 page to see the results.');
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    
    console.log('\n🛠️  FALLBACK OPTION:');
    console.log('Since automatic execution failed, please manually execute these SQL statements:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Execute each of these statements:');
    console.log('');
    console.log('-- Policy 1: Anonymous access');
    console.log('CREATE POLICY "Public users can view food_trucks"');
    console.log('ON public.food_trucks');
    console.log('FOR SELECT');
    console.log('TO anon');
    console.log('USING (verification_status IN (\'verified\', \'pending\'));');
    console.log('');
    console.log('-- Policy 2: Authenticated access');
    console.log('CREATE POLICY "Authenticated users can view food_trucks"');
    console.log('ON public.food_trucks');
    console.log('FOR SELECT');
    console.log('TO authenticated');
    console.log('USING (verification_status IN (\'verified\', \'pending\'));');
  }
}

executeSQLPolicies().then(() => {
  console.log('\n✅ Policy creation process complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
