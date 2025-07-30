import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkConstraints() {
  console.log('🔍 Checking food_trucks table constraints...');
  
  // Check indexes
  const { data: indexes, error: indexError } = await supabase
    .rpc('execute_sql', {
      sql: `
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE tablename = 'food_trucks'
      `
    });
  
  if (indexError) {
    console.log('Indexes query error:', indexError);
  } else {
    console.log('📋 Indexes on food_trucks table:');
    indexes.forEach(index => {
      console.log(`  - ${index.indexname}: ${index.indexdef}`);
    });
  }
  
  // Check constraints
  const { data: constraints, error: constraintError } = await supabase
    .rpc('execute_sql', {
      sql: `
        SELECT conname, contype, conkey
        FROM pg_constraint 
        WHERE conrelid = 'food_trucks'::regclass
      `
    });
  
  if (constraintError) {
    console.log('Constraints query error:', constraintError);
  } else {
    console.log('🔒 Constraints on food_trucks table:');
    constraints.forEach(constraint => {
      console.log(`  - ${constraint.conname} (type: ${constraint.contype})`);
    });
  }
  
  // Check if name column has unique constraint
  const { data: nameConstraints, error: nameError } = await supabase
    .rpc('execute_sql', {
      sql: `
        SELECT tc.constraint_name, tc.constraint_type
        FROM information_schema.table_constraints tc
        JOIN information_schema.constraint_column_usage ccu 
          ON tc.constraint_name = ccu.constraint_name
        WHERE tc.table_name = 'food_trucks' 
          AND ccu.column_name = 'name'
      `
    });
  
  if (nameError) {
    console.log('Name constraints query error:', nameError);
  } else {
    console.log('🏷️ Name column constraints:');
    if (nameConstraints.length === 0) {
      console.log('  ❌ No constraints found on name column');
    } else {
      nameConstraints.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name} (${constraint.constraint_type})`);
      });
    }
  }
}

checkConstraints().catch(console.error);
