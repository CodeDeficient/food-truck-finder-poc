#!/usr/bin/env node

/**
 * Script to check current state of food trucks, jobs, and duplicates
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

async function checkCurrentState() {
  console.log('🔍 Checking current system state...');
  
  try {
    // Get total food trucks
    const { count: truckCount, error: truckError } = await supabase
      .from('food_trucks')
      .select('*', { count: 'exact', head: true });

    if (truckError) {
      console.error('❌ Error counting food trucks:', truckError.message);
    } else {
      console.log(`🚚 Total food trucks: ${truckCount}`);
    }

    // Get job statistics
    const { data: jobStats, error: jobError } = await supabase
      .from('scraping_jobs')
      .select('status');

    if (jobError) {
      console.error('❌ Error fetching job stats:', jobError.message);
    } else {
      const stats = jobStats.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Job Statistics:');
      Object.entries(stats).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }

    // Get discovered URL statistics
    const { data: urlStats, error: urlError } = await supabase
      .from('discovered_urls')
      .select('status');

    if (urlError) {
      console.error('❌ Error fetching URL stats:', urlError.message);
    } else {
      const stats = urlStats.reduce((acc, url) => {
        acc[url.status] = (acc[url.status] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n🌐 Discovered URL Statistics:');
      Object.entries(stats).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });
    }

    // Check for obvious duplicates (same name)
    console.log('\n🔍 Checking for obvious duplicates...');
    const { data: trucks, error: trucksError } = await supabase
      .from('food_trucks')
      .select('name, id, source_urls')
      .limit(100);

    if (!trucksError && trucks) {
      const nameCounts = trucks.reduce((acc, truck) => {
        acc[truck.name] = (acc[truck.name] || 0) + 1;
        return acc;
      }, {});
      
      const duplicates = Object.entries(nameCounts)
        .filter(([name, count]) => count > 1)
        .sort((a, b) => b[1] - a[1]);
      
      console.log(`📊 Found ${duplicates.length} truck names that appear multiple times:`);
      duplicates.slice(0, 10).forEach(([name, count]) => {
        console.log(`  ${name}: ${count} occurrences`);
      });
      
      if (duplicates.length > 10) {
        console.log(`  ... and ${duplicates.length - 10} more duplicate names`);
      }
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
}

// Run the check
checkCurrentState().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
