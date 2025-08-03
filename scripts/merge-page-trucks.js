#!/usr/bin/env node

/**
 * Script to merge the Page's Okra Grill duplicates
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

// Simple merge function since we can't import the service
async function mergeTrucks(targetId, sourceId) {
  try {
    // Get both trucks
    const { data: targetTruck, error: targetError } = await supabase
      .from('food_trucks')
      .select('*')
      .eq('id', targetId)
      .single();

    const { data: sourceTruck, error: sourceError } = await supabase
      .from('food_trucks')
      .select('*')
      .eq('id', sourceId)
      .single();

    if (targetError || sourceError) {
      return {
        error: `Failed to retrieve trucks: ${targetError?.message || sourceError?.message}`
      };
    }

    // Merge logic: prefer non-null, more complete data
    const mergedData = {
      name: targetTruck.name ?? sourceTruck.name,
      description: targetTruck.description ?? sourceTruck.description,
      cuisine_type: (targetTruck.cuisine_type?.length ?? 0) > 0 ? targetTruck.cuisine_type : sourceTruck.cuisine_type,
      price_range: targetTruck.price_range ?? sourceTruck.price_range,
      current_location: targetTruck.current_location ?? sourceTruck.current_location,
      contact_info: {
        ...sourceTruck.contact_info,
        ...targetTruck.contact_info, // Target takes precedence
      },
      operating_hours: targetTruck.operating_hours ?? sourceTruck.operating_hours,
      menu: (targetTruck.menu?.length ?? 0) > 0 ? targetTruck.menu : sourceTruck.menu,
      social_media: {
        ...sourceTruck.social_media,
        ...targetTruck.social_media,
      },
      source_urls: [...new Set([...(targetTruck.source_urls ?? []), ...(sourceTruck.source_urls ?? [])])],
      last_scraped_at: new Date().toISOString(),
    };

    // Update target with merged data
    const { data: updatedTruck, error: updateError } = await supabase
      .from('food_trucks')
      .update(mergedData)
      .eq('id', targetId)
      .select()
      .single();

    if (updateError) {
      return {
        error: `Failed to update target truck with merged data: ${updateError.message}`
      };
    }

    console.log(`✅ Merged truck ${sourceId} into ${targetId}`);
    return updatedTruck;
  } catch (error) {
    return {
      error: `Failed to merge trucks: ${error.message}`
    };
  }
}

async function mergePageTrucks() {
  console.log('🔍 Finding and merging Page\'s Okra Grill duplicates...');
  
  try {
    // Get both Page's trucks
    const { data: pageTrucks, error } = await supabase
      .from('food_trucks')
      .select('name, id, created_at, last_scraped_at, source_urls')
      .ilike('name', '%page%');

    if (error) {
      console.error('❌ Error fetching Page trucks:', error.message);
      process.exit(1);
    }

    if (!pageTrucks || pageTrucks.length < 2) {
      console.log('✅ No Page duplicates found or only one entry');
      return;
    }

    console.log(`\n📋 Found ${pageTrucks.length} Page-related trucks:`);
    pageTrucks.forEach((truck, index) => {
      console.log(`  ${index + 1}. "${truck.name}" (ID: ${truck.id})`);
      console.log(`     Created: ${truck.created_at}`);
      console.log(`     Last scraped: ${truck.last_scraped_at}`);
      if (truck.source_urls && truck.source_urls.length > 0) {
        console.log(`     Source: ${truck.source_urls[0]}`);
      }
    });

    // Sort by creation date (oldest first) - keep the oldest as target
    const sortedTrucks = pageTrucks.sort((a, b) => 
      new Date(a.created_at) - new Date(b.created_at)
    );

    const targetTruck = sortedTrucks[0];
    const sourceTruck = sortedTrucks[1];

    console.log(`\n🎯 Target truck (will be kept): "${targetTruck.name}" (ID: ${targetTruck.id})`);
    console.log(`🗑️  Source truck (will be merged): "${sourceTruck.name}" (ID: ${sourceTruck.id})`);

    // Auto-merge without confirmation for ESM compatibility
    console.log('\n⚠️  Auto-merging Page\'s Okra Grill duplicates...');
    
    try {
      console.log('\n🔄 Merging trucks...');
      const result = await mergeTrucks(targetTruck.id, sourceTruck.id);
      
      if (result.error) {
        console.error('❌ Merge failed:', result.error);
        process.exit(1);
      }
      
      console.log('✅ Merge completed successfully!');
      console.log(`   Merged data from ${sourceTruck.id} into ${targetTruck.id}`);
      
      // Delete the source truck
      console.log('🗑️  Deleting source truck...');
      const { error: deleteError } = await supabase
        .from('food_trucks')
        .delete()
        .eq('id', sourceTruck.id);
        
      if (deleteError) {
        console.error('⚠️  Warning: Failed to delete source truck:', deleteError.message);
        console.log('   You may need to manually delete the source truck.');
      } else {
        console.log('✅ Source truck deleted successfully');
      }
      
      console.log('\n🎉 Page\'s Okra Grill duplicates have been resolved!');
      
    } catch (error) {
      console.error('💥 Fatal error during merge:', error);
      process.exit(1);
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the merge
mergePageTrucks().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
