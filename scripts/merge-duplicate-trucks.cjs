require('dotenv').config({ path: '.env.local' });

async function mergeDuplicates() {
  const { createClient } = await import('@supabase/supabase-js');
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  console.log('=== Finding Duplicate Food Trucks ===\n');

  // Get all food trucks
  const { data: trucks } = await supabase
    .from('food_trucks')
    .select('*')
    .order('name');

  if (!trucks || trucks.length === 0) {
    console.log('No trucks found');
    return;
  }

  // Function to normalize truck names for comparison
  function normalize(name) {
    return name
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[',.-]/g, '')
      .replace(/\b(llc|inc|corp|corporation|company|co)\b/g, '')
      .replace(/\bfood\s+truck\b/g, '')
      .replace(/\bfood\s+trailer\b/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Group potential duplicates
  const groups = {};
  trucks.forEach(truck => {
    const key = normalize(truck.name);
    if (!groups[key]) groups[key] = [];
    groups[key].push(truck);
  });

  // Find groups with duplicates
  const duplicateGroups = Object.values(groups).filter(group => group.length > 1);

  if (duplicateGroups.length === 0) {
    console.log('No duplicates found!');
    return;
  }

  console.log(`Found ${duplicateGroups.length} groups of duplicates:\n`);

  // Process each duplicate group
  for (const group of duplicateGroups) {
    console.log(`\n📋 Duplicate group:`);
    group.forEach((truck, i) => {
      console.log(`  ${i + 1}. "${truck.name}" (ID: ${truck.id}, Score: ${truck.data_quality_score || 0})`);
    });

    // Choose the best record (highest quality score, most data)
    const primary = group.reduce((best, current) => {
      const bestScore = best.data_quality_score || 0;
      const currentScore = current.data_quality_score || 0;
      const bestDataCount = Object.keys(best).filter(k => best[k] !== null).length;
      const currentDataCount = Object.keys(current).filter(k => current[k] !== null).length;
      
      if (currentScore > bestScore) return current;
      if (currentScore === bestScore && currentDataCount > bestDataCount) return current;
      return best;
    });

    const toMerge = group.filter(t => t.id !== primary.id);
    
    console.log(`  ✓ Keeping: "${primary.name}" (ID: ${primary.id})`);
    console.log(`  → Merging ${toMerge.length} duplicates...`);

    // Merge data from duplicates
    let mergedData = { ...primary };
    
    // Merge arrays (source_urls, cuisine_type, specialties)
    const arrayFields = ['source_urls', 'cuisine_type', 'specialties'];
    arrayFields.forEach(field => {
      const allValues = group.flatMap(t => t[field] || []);
      mergedData[field] = [...new Set(allValues)];
    });

    // Merge contact info and social media
    mergedData.contact_info = mergedData.contact_info || {};
    mergedData.social_media = mergedData.social_media || {};
    
    group.forEach(truck => {
      if (truck.contact_info) {
        mergedData.contact_info = { ...mergedData.contact_info, ...truck.contact_info };
      }
      if (truck.social_media) {
        mergedData.social_media = { ...mergedData.social_media, ...truck.social_media };
      }
    });

    // Take the best description (longest)
    mergedData.description = group
      .map(t => t.description)
      .filter(d => d)
      .sort((a, b) => b.length - a.length)[0] || mergedData.description;

    // Update primary record with merged data
    const { error: updateError } = await supabase
      .from('food_trucks')
      .update({
        ...mergedData,
        last_scraped_at: new Date().toISOString()
      })
      .eq('id', primary.id);

    if (updateError) {
      console.error(`  ❌ Error updating primary: ${updateError.message}`);
      continue;
    }

    // Delete duplicates
    const duplicateIds = toMerge.map(t => t.id);
    const { error: deleteError } = await supabase
      .from('food_trucks')
      .delete()
      .in('id', duplicateIds);

    if (deleteError) {
      console.error(`  ❌ Error deleting duplicates: ${deleteError.message}`);
    } else {
      console.log(`  ✓ Merged and deleted ${toMerge.length} duplicates`);
    }
  }

  // Final count
  const { count } = await supabase
    .from('food_trucks')
    .select('*', { count: 'exact', head: true });

  console.log(`\n✅ Complete! Total trucks after deduplication: ${count}`);
}

mergeDuplicates().catch(console.error);
