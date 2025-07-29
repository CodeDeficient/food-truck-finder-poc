#!/usr/bin/env node

/**
 * Script to check for Page's Okra Grill duplicates with different capitalizations
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkPageTrucks() {
  console.log('🔍 Checking for Page-related food trucks...');
  
  try {
    // Get all trucks with "page" in the name (case insensitive)
    const { data: pageTrucks, error } = await supabase
      .from('food_trucks')
      .select('name, id, source_urls')
      .ilike('name', '%page%');

    if (error) {
      console.error('❌ Error fetching Page trucks:', error.message);
      process.exit(1);
    }

    if (!pageTrucks || pageTrucks.length === 0) {
      console.log('✅ No Page-related trucks found');
      return;
    }

    console.log(`\n📋 Found ${pageTrucks.length} Page-related trucks:`);
    pageTrucks.forEach(truck => {
      console.log(`  "${truck.name}" (ID: ${truck.id})`);
      if (truck.source_urls && truck.source_urls.length > 0) {
        console.log(`    Source: ${truck.source_urls[0]}`);
      }
    });

    // Check for exact duplicates with different capitalizations
    const nameCounts = {};
    pageTrucks.forEach(truck => {
      const normalizedName = truck.name.toLowerCase().trim();
      if (!nameCounts[normalizedName]) {
        nameCounts[normalizedName] = [];
      }
      nameCounts[normalizedName].push(truck);
    });

    const duplicates = Object.entries(nameCounts).filter(([_, trucks]) => trucks.length > 1);
    
    if (duplicates.length > 0) {
      console.log('\n⚠️  DUPLICATE NAMES FOUND (different capitalizations):');
      duplicates.forEach(([normalizedName, trucks]) => {
        console.log(`  "${normalizedName}" appears ${trucks.length} times:`);
        trucks.forEach(truck => {
          console.log(`    - "${truck.name}" (ID: ${truck.id})`);
        });
      });
    } else {
      console.log('\n✅ No duplicate names found (case-insensitive check)');
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the check
checkPageTrucks().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
