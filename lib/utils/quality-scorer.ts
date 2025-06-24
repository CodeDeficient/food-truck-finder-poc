import type { FoodTruck } from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export interface QualityAssessment {
  score: number;
  issues: string[];
}

export type QualityCategory = {
  label: string;
  color: string;
};

export function calculateQualityScore(truck: FoodTruck): QualityAssessment {
  let score = 1; // Start with a perfect score
  const issues: string[] = [];

  // Check for essential fields
  if (!truck.name || truck.name.length === 0) {
    score -= 0.2;
    issues.push('Missing name');
  }
  if (!truck.description || truck.description.length === 0) {
    score -= 0.1;
    issues.push('Missing description');
  }
  if (!truck.cuisine_type || truck.cuisine_type.length === 0) {
    score -= 0.1;
    issues.push('Missing cuisine type');
  }
  if (!truck.price_range || truck.price_range.length === 0) {
    score -= 0.05;
    issues.push('Missing price range');
  }
  if (!truck.average_rating) {
    score -= 0.05;
    issues.push('Missing average rating');
  }
  if (!truck.review_count) {
    score -= 0.05;
    issues.push('Missing review count');
  }
  if (!truck.website || truck.website.length === 0) {
    score -= 0.05;
    issues.push('Missing website');
  }
  if (!truck.phone_number || truck.phone_number.length === 0) {
    score -= 0.05;
    issues.push('Missing phone number');
  }
  if (!truck.email || truck.email.length === 0) {
    score -= 0.05;
    issues.push('Missing email');
  }
  if (!truck.instagram_handle || truck.instagram_handle.length === 0) {
    score -= 0.02;
    issues.push('Missing Instagram handle');
  }
  if (!truck.facebook_handle || truck.facebook_handle.length === 0) {
    score -= 0.02;
    issues.push('Missing Facebook handle');
  }
  if (!truck.twitter_handle || truck.twitter_handle.length === 0) {
    score -= 0.02;
    issues.push('Missing Twitter handle');
  }

  // Check for location data
  if (!truck.current_location?.lat || !truck.current_location.lng) {
    score -= 0.15;
    issues.push('Missing current location data');
  } else {
    // Check for stale location data (e.g., older than 7 days)
    if (truck.current_location.timestamp) {
      const locationAge = Date.now() - new Date(truck.current_location.timestamp).getTime();
      const daysSinceUpdate = locationAge / (1000 * 60 * 60 * 24);
      if (daysSinceUpdate > 7) {
        score -= 0.1;
        issues.push('Stale location data');
      }
    } else {
      score -= 0.05;
      issues.push('Missing location timestamp');
    }
  }

  // Check for schedule data
  if (!truck.schedule || truck.schedule.length === 0) {
    score -= 0.1;
    issues.push('Missing schedule data');
  }

  // Ensure score doesn't go below 0
  score = Math.max(0, score);

  return { score, issues };
}

export function categorizeQualityScore(score: number): QualityCategory {
  if (score >= 0.8) {
    return { label: 'High', color: 'bg-green-500' };
  } else if (score >= 0.5) {
    return { label: 'Medium', color: 'bg-yellow-500' };
  } else {
    return { label: 'Low', color: 'bg-red-500' };
  }
}

export function formatQualityScore(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'N/A';
  }
  return `${(score * 100).toFixed(0)}%`;
}

export function getQualityBadgeClasses(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'bg-gray-500';
  }
  const category = categorizeQualityScore(score);
  return category.color;
}

export function getQualityScoreAriaLabel(score: number | null | undefined): string {
  if (score === null || score === undefined) {
    return 'Data quality score not available';
  }
  const formattedScore = formatQualityScore(score);
  const category = categorizeQualityScore(score);
  return `Data quality: ${formattedScore}, Category: ${category.label}`;
}

export const DataQualityService = {
  calculateQualityScore,
  categorizeQualityScore,
  formatQualityScore,
  getQualityBadgeClasses,
  getQualityScoreAriaLabel,

  async batchUpdateQualityScores(limit: number = 100): Promise<{ updatedCount: number; errors: string[] }> {
    const { data: trucks, error } = await supabase
      .from('food_trucks')
      .select('id, name, description, cuisine_type, price_range, average_rating, review_count, website, phone_number, email, instagram_handle, facebook_handle, twitter_handle, current_location, schedule, verification_status, source_urls, last_scraped_at, test_run_flag')
      .limit(limit);

    if (error) {
      console.error('Error fetching trucks for batch update:', error);
      return { updatedCount: 0, errors: [error.message] };
    }

    const updates = trucks.map(truck => {
      const { score } = calculateQualityScore(truck);
      return {
        id: truck.id,
        data_quality_score: score,
      };
    });

    const { error: updateError, count } = await supabase
      .from('food_trucks')
      .upsert(updates, { onConflict: 'id' })
      .select();

    if (updateError) {
      console.error('Error batch updating quality scores:', updateError);
      return { updatedCount: 0, errors: [updateError.message] };
    }

    return { updatedCount: count ?? 0, errors: [] };
  },

  async updateTruckQualityScore(truckId: string): Promise<{ success: boolean }> {
    const { data: truck, error: fetchError } = await supabase
      .from('food_trucks')
      .select('id, name, description, cuisine_type, price_range, average_rating, review_count, website, phone_number, email, instagram_handle, facebook_handle, twitter_handle, current_location, schedule, verification_status, source_urls, last_scraped_at, test_run_flag')
      .eq('id', truckId)
      .single();

    if (fetchError || !truck) {
      console.error(`Error fetching truck ${truckId} for quality update:`, fetchError);
      return { success: false };
    }

    const { score } = calculateQualityScore(truck);

    const { error: updateError } = await supabase
      .from('food_trucks')
      .update({ data_quality_score: score })
      .eq('id', truckId);

    if (updateError) {
      console.error(`Error updating quality score for truck ${truckId}:`, updateError);
      return { success: false };
    }

    return { success: true };
  },
};
