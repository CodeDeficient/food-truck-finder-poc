#!/usr/bin/env tsx

/**
 * Schema Validation Script for Uprooted Vegan Cuisine Onboarding
 * 
 * This script validates and maps the required fields for onboarding
 * Uprooted Vegan Cuisine data against the current database schema.
 */

import type { FoodTruck } from '../lib/types';

// Required fields for Uprooted Vegan Cuisine as provided by user
const REQUIRED_FIELDS = [
  'id',
  'updated_at', 
  'last_scraped_at',  // This field exists in current schema
  'cuisine_type',
  'price_range',
  'specialties',
  'exact_location',
  'city_location',
  'user_id',         // NOTE: This field doesn't exist in current schema
  'state',           // NOTE: This field doesn't exist in current schema
  'name',
  'description',
  'current_location',
  'scheduled_locations',
  'operating_hours',
  'menu',
  'contact_info',
  'social_media',
  'data_quality_score',
  'verification_status',
  'source_urls',
  'created_at'
];

// Current FoodTruck schema fields (based on analysis)
const CURRENT_SCHEMA_FIELDS = [
  'id',
  'created_at',
  'updated_at',
  'last_updated_at',        // Maps to user's 'last_update_at'
  'name',
  'description',
  'cuisine_type',
  'price_range',
  'specialties',
  'current_location',
  'exact_location',
  'city_location',
  'scheduled_locations',
  'operating_hours',
  'menu',
  'contact_info',
  'social_media',
  'data_quality_score',
  'verification_status',
  'source_urls',
  'is_active',
  'image_url',
  'average_rating',
  'review_count',
  'last_scraped_at',
  'test_run_flag',
  'website',
  'phone_number',
  'email',
  'instagram_handle',
  'facebook_handle',
  'twitter_handle',
  'schedule'
];

interface SchemaAnalysisResult {
  missingFields: string[];
  extraFields: string[];
  fieldMappings: Record<string, string>;
  compatibleFields: string[];
}

function analyzeSchemaCompatibility(): SchemaAnalysisResult {
  const requiredSet = new Set(REQUIRED_FIELDS);
  const currentSet = new Set(CURRENT_SCHEMA_FIELDS);
  
  const missingFields: string[] = [];
  const compatibleFields: string[] = [];
  const fieldMappings: Record<string, string> = {};
  
  // Check each required field
  for (const field of REQUIRED_FIELDS) {
    if (currentSet.has(field)) {
      compatibleFields.push(field);
    } else {
      // Check for known mappings
      if (field === 'last_update_at' && currentSet.has('last_updated_at')) {
        fieldMappings['last_update_at'] = 'last_updated_at';
        compatibleFields.push(field);
      } else {
        missingFields.push(field);
      }
    }
  }
  
  // Find extra fields in current schema not required
  const extraFields = CURRENT_SCHEMA_FIELDS.filter(field => 
    !requiredSet.has(field) && !Object.values(fieldMappings).includes(field)
  );
  
  return {
    missingFields,
    extraFields,
    fieldMappings,
    compatibleFields
  };
}

interface UprootedVeganData {
  // Define the structure you expect from Uprooted Vegan Cuisine data
  name: string;
  cuisine_type: string[];
  description?: string;
  price_range?: '$' | '$$' | '$$$' | '$$$$';
  specialties?: string[];
  user_id?: string;  // This field needs to be added to schema
  state?: string;    // This field needs to be added to schema
  // ... other fields
}

function createMigrationScript(analysis: SchemaAnalysisResult): string {
  let migration = `-- Migration: Add missing fields for Uprooted Vegan Cuisine onboarding\n\n`;
  
  if (analysis.missingFields.length > 0) {
    migration += `-- Add missing fields to food_trucks table\n`;
    
    for (const field of analysis.missingFields) {
      switch (field) {
        case 'user_id':
          migration += `ALTER TABLE public.food_trucks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);\n`;
          break;
        case 'state':
          migration += `ALTER TABLE public.food_trucks ADD COLUMN IF NOT EXISTS state VARCHAR(2) CHECK (LENGTH(state) = 2);\n`;
          break;
        default:
          migration += `-- TODO: Define appropriate type for field: ${field}\n`;
      }
    }
    migration += `\n`;
  }
  
  if (Object.keys(analysis.fieldMappings).length > 0) {
    migration += `-- Field mappings required during data import:\n`;
    for (const [userField, dbField] of Object.entries(analysis.fieldMappings)) {
      migration += `-- Map '${userField}' to '${dbField}' in application layer\n`;
    }
    migration += `\n`;
  }
  
  // Add indexes for new fields
  if (analysis.missingFields.includes('user_id')) {
    migration += `CREATE INDEX IF NOT EXISTS idx_food_trucks_user_id ON public.food_trucks (user_id);\n`;
  }
  if (analysis.missingFields.includes('state')) {
    migration += `CREATE INDEX IF NOT EXISTS idx_food_trucks_state ON public.food_trucks (state);\n`;
  }
  
  return migration;
}

function createDataMapper(): string {
  return `
/**
 * Data mapper for Uprooted Vegan Cuisine onboarding
 */
export function mapUprootedVeganData(data: UprootedVeganData): Partial<FoodTruck> {
  return {
    name: data.name,
    description: data.description,
    cuisine_type: data.cuisine_type,
    price_range: data.price_range,
    specialties: data.specialties || [],
    // Handle field mappings
    last_updated_at: new Date().toISOString(), // Maps from user's 'last_update_at'
    // Handle new fields
    user_id: data.user_id,
    // state: data.state, // Will be available after schema migration
    // Set defaults for required fields
    data_quality_score: 0.5, // Initial score
    verification_status: 'pending' as const,
    source_urls: [],
    current_location: {
      lat: 0,
      lng: 0,
      address: undefined,
      timestamp: new Date().toISOString()
    },
    operating_hours: {
      monday: undefined,
      tuesday: undefined,
      wednesday: undefined,
      thursday: undefined,
      friday: undefined,
      saturday: undefined,
      sunday: undefined
    },
    menu: [],
    contact_info: {},
    social_media: {}
  };
}
`;
}

function main() {
  console.log('=== Uprooted Vegan Cuisine Schema Analysis ===\n');
  
  const analysis = analyzeSchemaCompatibility();
  
  console.log('✅ Compatible Fields:', analysis.compatibleFields.length);
  console.log('   ', analysis.compatibleFields.join(', '));
  console.log();
  
  if (Object.keys(analysis.fieldMappings).length > 0) {
    console.log('🔄 Field Mappings Required:');
    for (const [userField, dbField] of Object.entries(analysis.fieldMappings)) {
      console.log(`   ${userField} → ${dbField}`);
    }
    console.log();
  }
  
  if (analysis.missingFields.length > 0) {
    console.log('❌ Missing Fields (require schema changes):', analysis.missingFields.length);
    console.log('   ', analysis.missingFields.join(', '));
    console.log();
    
    console.log('📝 Suggested Migration:');
    console.log(createMigrationScript(analysis));
  }
  
  if (analysis.extraFields.length > 0) {
    console.log('ℹ️  Extra Fields (available but not required):', analysis.extraFields.length);
    console.log('   ', analysis.extraFields.slice(0, 10).join(', '));
    if (analysis.extraFields.length > 10) {
      console.log(`   ... and ${analysis.extraFields.length - 10} more`);
    }
    console.log();
  }
  
  console.log('💡 Data Mapper Function:');
  console.log(createDataMapper());
  
  // Calculate compatibility percentage
  const compatibility = (analysis.compatibleFields.length / REQUIRED_FIELDS.length) * 100;
  console.log(`\n🎯 Schema Compatibility: ${compatibility.toFixed(1)}%`);
  
  if (compatibility >= 90) {
    console.log('✅ High compatibility - minimal changes needed');
  } else if (compatibility >= 70) {
    console.log('⚠️  Medium compatibility - some schema changes required');
  } else {
    console.log('🚨 Low compatibility - significant schema changes needed');
  }
}

// Run main function if this is the entry point
main();

export { analyzeSchemaCompatibility, createMigrationScript, createDataMapper };
