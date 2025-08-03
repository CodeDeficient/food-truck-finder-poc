import { createClient } from '@supabase/supabase-js';

// Create service client for admin operations
function createSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}
import { APISchemasJSON } from '@/lib/validation/schemas/v1/api';
import { CommonSchemasJSON } from '@/lib/validation/schemas/v1/common';

interface SchemaUploadResult {
  schemaName: string;
  success: boolean;
  error?: string;
}

async function uploadValidationSchemas(): Promise<SchemaUploadResult[]> {
  const supabase = createSupabaseServiceClient();
  const results: SchemaUploadResult[] = [];

  // Combine all schemas
  const allSchemas = {
    ...CommonSchemasJSON,
    ...APISchemasJSON
  };

  console.log('📋 Starting validation schema upload...');
  console.log(`📊 Found ${Object.keys(allSchemas).length} schemas to upload`);

  for (const [schemaName, jsonSchema] of Object.entries(allSchemas)) {
    try {
      console.log(`⏳ Uploading schema: ${schemaName}`);
      
      // Call the upsert_validation_schema function
      const { data, error } = await supabase.rpc('upsert_validation_schema', {
        schema_name_param: schemaName,
        json_schema_param: jsonSchema,
        version_param: 'v1'
      });

      if (error) {
        console.error(`❌ Failed to upload ${schemaName}:`, error);
        results.push({
          schemaName,
          success: false,
          error: error.message
        });
      } else if (data && !data.success) {
        console.error(`❌ Failed to upload ${schemaName}:`, data.error);
        results.push({
          schemaName,
          success: false,
          error: data.error
        });
      } else {
        console.log(`✅ Successfully uploaded schema: ${schemaName}`);
        results.push({
          schemaName,
          success: true
        });
      }
    } catch (err) {
      console.error(`❌ Exception uploading ${schemaName}:`, err);
      results.push({
        schemaName,
        success: false,
        error: err instanceof Error ? err.message : String(err)
      });
    }
  }

  return results;
}

async function validateSchemaUpload(): Promise<void> {
  const supabase = createSupabaseServiceClient();
  
  console.log('\n🔍 Validating schema upload...');
  
  const { data: schemas, error } = await supabase
    .from('validation_schemas')
    .select('schema_name, version, created_at')
    .order('schema_name');

  if (error) {
    console.error('❌ Failed to validate schemas:', error);
    return;
  }

  console.log(`✅ Found ${schemas.length} schemas in database:`);
  schemas.forEach(schema => {
    console.log(`  📄 ${schema.schema_name} (${schema.version}) - ${schema.created_at}`);
  });
}

async function testValidationFunction(): Promise<void> {
  const supabase = createSupabaseServiceClient();
  
  console.log('\n🧪 Testing validation function...');

  // Test with valid data
  const validData = {
    name: 'Test Food Truck',
    description: 'A test food truck',
    cuisine_type: ['American'],
    price_range: '$',
    specialties: ['Burgers']
  };

  console.log('Testing with valid data...');
  const { data: validResult, error: validError } = await supabase.rpc('supabase_validate', {
    data: validData,
    schema_name_param: 'CreateFoodTruck'
  });

  if (validError) {
    console.error('❌ Error testing valid data:', validError);
  } else {
    console.log('✅ Valid data test result:', validResult);
  }

  // Test with invalid data
  const invalidData = {
    // Missing required 'name' field
    description: 'A test food truck without name',
    cuisine_type: 'American', // Should be array
    price_range: 'invalid' // Should be one of $, $$, $$$, $$$$
  };

  console.log('Testing with invalid data...');
  const { data: invalidResult, error: invalidError } = await supabase.rpc('supabase_validate', {
    data: invalidData,
    schema_name_param: 'CreateFoodTruck'
  });

  if (invalidError) {
    console.error('❌ Error testing invalid data:', invalidError);
  } else {
    console.log('✅ Invalid data test result:', invalidResult);
  }
}

async function main() {
  try {
    console.log('🚀 Setting up validation schemas for Supabase...\n');

    // Upload schemas
    const results = await uploadValidationSchemas();

    // Print summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success);

    console.log('\n📊 Upload Summary:');
    console.log(`✅ Successful: ${successful}/${results.length}`);
    
    if (failed.length > 0) {
      console.log(`❌ Failed: ${failed.length}/${results.length}`);
      failed.forEach(failure => {
        console.log(`  - ${failure.schemaName}: ${failure.error}`);
      });
    }

    // Validate the upload
    await validateSchemaUpload();

    // Test the validation function
    await testValidationFunction();

    if (failed.length === 0) {
      console.log('\n🎉 All validation schemas uploaded successfully!');
      console.log('💡 You can now use supabase_validate(data, schema_name) in your database functions and triggers.');
    } else {
      console.log('\n⚠️  Some schemas failed to upload. Please check the errors above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Only run if this script is executed directly
if (require.main === module) {
  main();
}

export { uploadValidationSchemas, validateSchemaUpload, testValidationFunction };
