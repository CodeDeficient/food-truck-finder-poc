require('dotenv').config({ path: '.env.local' });

async function findAndMergeDuplicates() {
  console.log('=== Finding and Merging Duplicate Food Trucks ===\n');
  
  // Import modules
  const { createClient } = require('@supabase/supabase-js');
  
  // Copy the duplicate prevention logic directly to avoid import issues
  const DUPLICATE_DETECTION_CONFIG = {
    thresholds: {
      name: 0.85,
      location: 0.9,
      phone: 1,
      website: 1,
      overall: 0.8,
    },
    weights: {
      name: 0.4,
      location: 0.3,
      contact: 0.2,
      menu: 0.1,
    },
  };

  // Helper functions copied from duplicatePrevention.js
  function normalizeFoodTruckName(name) {
    if (!name) return '';
    return name
      .toLowerCase()
      .trim()
      .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")
      .replace(/\s*\b(food\s+truck|food\s+trailer|mobile\s+kitchen|street\s+food|food\s+cart)\b\s*/gi, '')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s&'-]/g, '')
      .trim();
  }

  function calculateStringSimilarity(str1, str2) {
    if (!str1 || !str2) return 0;
    const normalized1 = normalizeFoodTruckName(str1);
    const normalized2 = normalizeFoodTruckName(str2);
    if (normalized1 === normalized2) return 1;
    
    const isSubstring = normalized1.includes(normalized2) || normalized2.includes(normalized1);
    if (isSubstring && (normalized1.length > 0 && normalized2.length > 0)) {
      const minLength = Math.min(normalized1.length, normalized2.length);
      const maxLength = Math.max(normalized1.length, normalized2.length);
      return 0.8 + (0.15 * (minLength / maxLength));
    }

    const matrix = [];
    const len1 = normalized1.length;
    const len2 = normalized2.length;

    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = normalized1[i - 1] === normalized2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  function calculateLocationSimilarity(loc1, loc2) {
    if (!loc1 || !loc2) return 0;
    let similarity = 0;
    let factors = 0;

    if (loc1.address && loc2.address) {
      similarity += calculateStringSimilarity(loc1.address, loc2.address);
      factors += 1;
    }

    if (loc1.lat && loc1.lng && loc2.lat && loc2.lng) {
      const R = 6371;
      const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
      const dLng = ((loc2.lng - loc1.lng) * Math.PI) / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((loc1.lat * Math.PI) / 180) *
        Math.cos((loc2.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      const distanceSimilarity = distance <= 0.1 ? 1 : Math.max(0, 1 - distance / 1);
      similarity += distanceSimilarity;
      factors += 1;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  function calculateContactSimilarity(contact1, contact2) {
    if (!contact1 || !contact2) return 0;
    let matches = 0;
    let total = 0;

    if (contact1.phone != undefined && contact2.phone != undefined) {
      const phone1 = contact1.phone.replaceAll(/\D/g, '');
      const phone2 = contact2.phone.replaceAll(/\D/g, '');
      if (phone1 === phone2) matches += 1;
      total += 1;
    }

    if (contact1.website != undefined && contact2.website != undefined) {
      const url1 = contact1.website
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
      const url2 = contact2.website
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
      if (url1 === url2) matches += 1;
      total += 1;
    }

    if (contact1.email != undefined && contact2.email != undefined) {
      if (contact1.email.toLowerCase() === contact2.email.toLowerCase()) matches += 1;
      total += 1;
    }

    return total > 0 ? matches / total : 0;
  }

  function calculateMenuSimilarity(menu1, menu2) {
    if (!menu1 || !menu2 || menu1.length === 0 || menu2.length === 0) return 0;
    const categories1 = menu1
      .map((cat) => cat.category?.toLowerCase() ?? '')
      .filter(Boolean);
    const categories2 = menu2
      .map((cat) => cat.category?.toLowerCase() ?? '')
      .filter(Boolean);
    const commonCategories = categories1.filter((cat) => categories2.includes(cat));
    const totalCategories = new Set([...categories1, ...categories2]).size;
    return totalCategories > 0 ? commonCategories.length / totalCategories : 0;
  }

  function calculateSimilarity(candidate, existing) {
    const breakdown = {};
    const matchedFields = [];

    const nameSimilarity = calculateStringSimilarity(candidate.name ?? '', existing.name ?? '');
    breakdown.name = nameSimilarity;
    if (nameSimilarity >= DUPLICATE_DETECTION_CONFIG.thresholds.name) {
      matchedFields.push('name');
    }

    const locationSimilarity = calculateLocationSimilarity(candidate.current_location, existing.current_location);
    breakdown.location = locationSimilarity;
    if (locationSimilarity >= DUPLICATE_DETECTION_CONFIG.thresholds.location) {
      matchedFields.push('location');
    }

    const contactSimilarity = calculateContactSimilarity(candidate.contact_info, existing.contact_info);
    breakdown.contact = contactSimilarity;
    if (contactSimilarity >= DUPLICATE_DETECTION_CONFIG.thresholds.phone) {
      matchedFields.push('contact');
    }

    const menuSimilarity = calculateMenuSimilarity(candidate.menu, existing.menu);
    breakdown.menu = menuSimilarity;
    if (menuSimilarity > 0.7) {
      matchedFields.push('menu');
    }

    const overall =
      nameSimilarity * DUPLICATE_DETECTION_CONFIG.weights.name +
      locationSimilarity * DUPLICATE_DETECTION_CONFIG.weights.location +
      contactSimilarity * DUPLICATE_DETECTION_CONFIG.weights.contact +
      menuSimilarity * DUPLICATE_DETECTION_CONFIG.weights.menu;

    return { overall, matchedFields, breakdown };
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get all food trucks
  const { data: allTrucks, error } = await supabase
    .from('food_trucks')
    .select('*')
    .order('name');

  if (error || !allTrucks) {
    console.error('Failed to fetch trucks:', error);
    return;
  }

  console.log(`Analyzing ${allTrucks.length} food trucks for duplicates...\n`);

  // Group potential duplicates using enhanced duplicate prevention logic
  const duplicateGroups = [];
  const processed = new Set();

  for (let i = 0; i < allTrucks.length; i++) {
    if (processed.has(i)) continue;
    
    const truck = allTrucks[i];
    const group = [truck];
    processed.add(i);

    // Find similar trucks using enhanced duplicate detection
    for (let j = i + 1; j < allTrucks.length; j++) {
      if (processed.has(j)) continue;
      
      const otherTruck = allTrucks[j];
      
      // Use the sophisticated duplicate prevention logic
      const similarity = calculateSimilarity(truck, otherTruck);
      
      // Check if they are duplicates based on the enhanced threshold
      if (similarity.overall >= 0.8) { // Use the same threshold as real-time system
        group.push(otherTruck);
        processed.add(j);
      }
    }

    if (group.length > 1) {
      duplicateGroups.push(group);
    }
  }

  console.log(`Found ${duplicateGroups.length} groups of potential duplicates:\n`);

  // Process each duplicate group
  for (const group of duplicateGroups) {
    console.log(`\nDuplicate Group (${group.length} trucks):`);
    group.forEach((truck, idx) => {
      console.log(`  ${idx + 1}. "${truck.name}" (ID: ${truck.id.substring(0, 8)}...)`);
      console.log(`     - URLs: ${truck.source_urls?.length || 0}`);
      console.log(`     - Last scraped: ${truck.last_scraped_at || 'Never'}`);
      console.log(`     - Has description: ${truck.description ? 'Yes' : 'No'}`);
    });

    // Auto-merge logic: Keep the one with most data
    const primary = group.reduce((best, current) => {
      const bestScore = calculateDataScore(best);
      const currentScore = calculateDataScore(current);
      return currentScore > bestScore ? current : best;
    });

    console.log(`\n  → Keeping: "${primary.name}" as primary`);

    // Merge all source URLs
    const allUrls = new Set();
    group.forEach(truck => {
      (truck.source_urls || []).forEach(url => allUrls.add(url));
    });

    // Merge data from all duplicates into primary
    const mergedData = {
      source_urls: Array.from(allUrls),
      last_scraped_at: new Date().toISOString(),
      // Take best values from all duplicates
      description: primary.description || group.find(t => t.description)?.description,
      cuisine_type: primary.cuisine_type?.length > 0 ? primary.cuisine_type : group.find(t => t.cuisine_type?.length > 0)?.cuisine_type,
      price_range: primary.price_range || group.find(t => t.price_range)?.price_range,
      specialties: primary.specialties?.length > 0 ? primary.specialties : group.find(t => t.specialties?.length > 0)?.specialties,
      contact_info: primary.contact_info || group.find(t => t.contact_info)?.contact_info,
      social_media: primary.social_media || group.find(t => t.social_media)?.social_media,
      current_location: primary.current_location || group.find(t => t.current_location)?.current_location,
    };

    // Update primary truck
    await supabase
      .from('food_trucks')
      .update(mergedData)
      .eq('id', primary.id);

    // Delete duplicates
    const duplicateIds = group.filter(t => t.id !== primary.id).map(t => t.id);
    if (duplicateIds.length > 0) {
      await supabase
        .from('food_trucks')
        .delete()
        .in('id', duplicateIds);
      
      console.log(`  ✓ Merged ${duplicateIds.length} duplicates into primary`);
    }
  }

  // Final count
  const { count } = await supabase
    .from('food_trucks')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Deduplication complete!`);
  console.log(`📊 Total food trucks now: ${count}`);
}

// Helper function to calculate data completeness score
function calculateDataScore(truck) {
  let score = 0;
  if (truck.name) score += 10;
  if (truck.description) score += 5;
  if (truck.cuisine_type?.length > 0) score += 3;
  if (truck.price_range) score += 2;
  if (truck.specialties?.length > 0) score += 3;
  if (truck.contact_info) score += 4;
  if (truck.social_media) score += 3;
  if (truck.current_location) score += 4;
  if (truck.source_urls?.length > 0) score += truck.source_urls.length;
  if (truck.last_scraped_at) score += 2;
  return score;
}

findAndMergeDuplicates().catch(console.error);
