#!/usr/bin/env node

/**
 * Map Data Quality Analysis Script
 * 
 * This script analyzes food truck location data to identify:
 * 1. Trucks missing coordinates
 * 2. Invalid coordinate data
 * 3. Trucks with incomplete address information
 * 4. Map performance bottlenecks
 */

const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing Supabase credentials!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function analyzeMapData() {
  console.log('🗺️ Analyzing food truck location data for map performance...\n');

  try {
    // Get all food trucks with location data
    const { data: trucks, error } = await supabase
      .from('food_trucks')
      .select('id, name, current_location, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching food trucks:', error);
      return;
    }

    console.log(`📊 Total food trucks in database: ${trucks.length}\n`);

    // Data quality analysis
    const stats = {
      total: trucks.length,
      hasLocation: 0,
      hasCoordinates: 0,
      hasAddress: 0,
      hasCompleteData: 0,
      missingLocation: 0,
      invalidCoordinates: 0,
      coordinateIssues: []
    };

    const invalidTrucks = [];
    const goodTrucks = [];

    trucks.forEach(truck => {
      const location = truck.current_location;

      if (!location) {
        stats.missingLocation++;
        invalidTrucks.push({
          id: truck.id,
          name: truck.name,
          issue: 'No location object'
        });
        return;
      }

      stats.hasLocation++;

      // Check coordinates
      const hasLat = typeof location.lat === 'number' && !isNaN(location.lat);
      const hasLng = typeof location.lng === 'number' && !isNaN(location.lng);

      if (hasLat && hasLng) {
        // Validate coordinate ranges
        const validLat = location.lat >= -90 && location.lat <= 90;
        const validLng = location.lng >= -180 && location.lng <= 180;

        if (validLat && validLng) {
          stats.hasCoordinates++;
          goodTrucks.push(truck);
        } else {
          stats.invalidCoordinates++;
          invalidTrucks.push({
            id: truck.id,
            name: truck.name,
            issue: `Invalid coordinates: lat=${location.lat}, lng=${location.lng}`
          });
        }
      } else {
        stats.invalidCoordinates++;
        invalidTrucks.push({
          id: truck.id,
          name: truck.name,
          issue: `Missing/invalid coordinates: lat=${location.lat}, lng=${location.lng}`
        });
      }

      // Check address
      if (location.address && location.address.trim() !== '') {
        stats.hasAddress++;
      }

      // Complete data check
      if (hasLat && hasLng && location.address && location.address.trim() !== '') {
        stats.hasCompleteData++;
      }
    });

    // Report results
    console.log('📈 Location Data Quality Report:');
    console.log(`  Total trucks: ${stats.total}`);
    console.log(`  ✅ Has location object: ${stats.hasLocation} (${(stats.hasLocation/stats.total*100).toFixed(1)}%)`);
    console.log(`  📍 Has valid coordinates: ${stats.hasCoordinates} (${(stats.hasCoordinates/stats.total*100).toFixed(1)}%)`);
    console.log(`  🏠 Has address: ${stats.hasAddress} (${(stats.hasAddress/stats.total*100).toFixed(1)}%)`);
    console.log(`  🎯 Complete location data: ${stats.hasCompleteData} (${(stats.hasCompleteData/stats.total*100).toFixed(1)}%)`);
    console.log(`  ❌ Missing location: ${stats.missingLocation}`);
    console.log(`  🚫 Invalid coordinates: ${stats.invalidCoordinates}`);

    console.log('\n🔍 Map Performance Analysis:');
    console.log(`  Renderable trucks: ${goodTrucks.length}`);
    console.log(`  Non-renderable trucks: ${invalidTrucks.length}`);
    
    if (goodTrucks.length > 0) {
      // Analyze coordinate distribution for Charleston area
      const charlestonLat = 32.7767;
      const charlestonLng = -79.9311;
      const radius = 50; // miles approximation in degrees
      
      const charlestonTrucks = goodTrucks.filter(truck => {
        const latDiff = Math.abs(truck.current_location.lat - charlestonLat);
        const lngDiff = Math.abs(truck.current_location.lng - charlestonLng);
        return latDiff < 1 && lngDiff < 1; // Rough Charleston area bounds
      });

      console.log(`  📍 Trucks in Charleston area: ${charlestonTrucks.length} (${(charlestonTrucks.length/goodTrucks.length*100).toFixed(1)}%)`);
    }

    if (invalidTrucks.length > 0) {
      console.log('\n🚨 Issues Found:');
      invalidTrucks.slice(0, 10).forEach((truck, index) => {
        console.log(`  ${index + 1}. ${truck.name}: ${truck.issue}`);
      });
      
      if (invalidTrucks.length > 10) {
        console.log(`  ... and ${invalidTrucks.length - 10} more trucks with issues`);
      }
    }

    // Performance recommendations
    console.log('\n💡 Map Performance Recommendations:');
    
    if (stats.invalidCoordinates > 0) {
      console.log(`  🔧 Fix ${stats.invalidCoordinates} trucks with invalid coordinates`);
    }
    
    if (stats.missingLocation > 0) {
      console.log(`  📍 Add location data for ${stats.missingLocation} trucks`);
    }
    
    if (stats.hasCompleteData < stats.total * 0.8) {
      console.log(`  📝 Improve address data completeness (currently ${(stats.hasCompleteData/stats.total*100).toFixed(1)}%)`);
    }

    const renderablePercentage = (goodTrucks.length / stats.total * 100);
    if (renderablePercentage < 90) {
      console.log(`  ⚠️  Only ${renderablePercentage.toFixed(1)}% of trucks can be displayed on map`);
    } else {
      console.log(`  ✅ Good map coverage: ${renderablePercentage.toFixed(1)}% of trucks are renderable`);
    }

    console.log('\n🎯 Next Steps:');
    console.log('  1. Run data cleanup to fix coordinate issues');
    console.log('  2. Implement geocoding for trucks missing coordinates');
    console.log('  3. Add fallback locations for trucks with invalid data');
    console.log('  4. Consider map clustering for better performance with many pins');

  } catch (error) {
    console.error('💥 Analysis failed:', error);
  }
}

// Run the analysis
analyzeMapData().then(() => {
  console.log('\n✅ Map data analysis complete!');
  process.exit(0);
}).catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
