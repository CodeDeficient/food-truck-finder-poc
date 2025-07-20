import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Applying RLS policy fix to food_trucks table...');
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

async function applyRLSFix() {
  try {
    console.log('📂 Reading SQL script...');
    const sqlScript = readFileSync('fix-rls-policies.sql', 'utf8');
    
    // Split the script into individual statements
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📜 Found ${statements.length} SQL statements to execute`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim().length === 0) {
        continue;
      }

      console.log(`\n🔨 Executing statement ${i + 1}:`);
      console.log(`   ${statement.substring(0, 80)}${statement.length > 80 ? '...' : ''}`);

      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: statement
        });

        if (error) {
          // Try direct execution if rpc fails
          console.log('   Trying direct execution...');
          const { data: directData, error: directError } = await supabase
            .from('_placeholder_')
            .select('1')
            .limit(0);
          
          // For policy operations, we'll use a different approach
          if (statement.includes('POLICY') || statement.includes('pg_policies')) {
            console.log('   ⚠️ Policy statement - may need manual execution in Supabase dashboard');
            console.log(`   📋 SQL: ${statement}`);
          } else {
            console.error(`   ❌ Error: ${error.message}`);
          }
        } else {
          console.log('   ✅ Success');
          if (data) {
            console.log('   📊 Result:', JSON.stringify(data, null, 2));
          }
        }
      } catch (execError) {
        console.error(`   💥 Execution error: ${execError.message}`);
      }
    }

    // Test if the fix worked
    console.log('\n🧪 Testing anonymous read access...');
    
    // Create a new client with anon key to test
    const anonClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: testData, error: testError } = await anonClient
      .from('food_trucks')
      .select('id, name, verification_status, is_active')
      .limit(5);

    if (testError) {
      console.error('❌ Anonymous access still blocked:', testError);
      console.log('\n💡 MANUAL STEPS NEEDED:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Navigate to Authentication > Policies');
      console.log('3. Find the food_trucks table');
      console.log('4. Add a new policy with these settings:');
      console.log('   - Policy name: "Public users can view food_trucks"');
      console.log('   - Allowed operation: SELECT');
      console.log('   - Target roles: anon');
      console.log('   - Policy definition: is_active IS NOT FALSE AND verification_status IN (\'verified\', \'pending\')');
      
    } else {
      console.log('✅ Anonymous access works!');
      console.log('📊 Found', testData.length, 'food trucks accessible to anonymous users');
      if (testData.length > 0) {
        console.log('🚛 Sample:', testData[0]);
      }
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error);
    
    console.log('\n💡 FALLBACK: Manual RLS Policy Setup');
    console.log('If this script failed, you can manually add the policy in Supabase:');
    console.log('\n1. Go to https://app.supabase.com/project/[your-project]/auth/policies');
    console.log('2. Find the food_trucks table');
    console.log('3. Click "New Policy"');
    console.log('4. Use these settings:');
    console.log('   - Policy name: Public users can view food_trucks');
    console.log('   - Allowed operation: SELECT');  
    console.log('   - Target roles: anon');
    console.log('   - Policy definition:');
    console.log('     is_active IS NOT FALSE AND verification_status IN (\'verified\', \'pending\')');
  }
}

applyRLSFix().then(() => {
  console.log('\n✅ RLS fix process complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
