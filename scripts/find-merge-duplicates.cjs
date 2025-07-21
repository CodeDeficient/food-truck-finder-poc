require('dotenv').config({ path: '.env.local' });

async function findAndMergeDuplicates() {
  console.log('=== Finding and Merging Duplicate Food Trucks ===\n');
  
  // Import modules
  const { createClient } = await import('@supabase/supabase-js');
  
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

  // Group potential duplicates by similar names
  const duplicateGroups = [];
  const processed = new Set();

  for (let i = 0; i < allTrucks.length; i++) {
    if (processed.has(i)) continue;
    
    const truck = allTrucks[i];
    const group = [truck];
    processed.add(i);

    // Find similar trucks
    for (let j = i + 1; j < allTrucks.length; j++) {
      if (processed.has(j)) continue;
      
      const otherTruck = allTrucks[j];
      
      // Check for name similarity (case insensitive, partial match)
      const name1 = truck.name.toLowerCase().trim();
      const name2 = otherTruck.name.toLowerCase().trim();
      
      // Check if names are similar
      if (
        name1 === name2 || // Exact match
        name1.includes(name2) || // One contains the other
        name2.includes(name1) ||
        levenshteinDistance(name1, name2) <= 3 // Close match
      ) {
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

// Simple Levenshtein distance for string similarity
function levenshteinDistance(a, b) {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

findAndMergeDuplicates().catch(console.error);
