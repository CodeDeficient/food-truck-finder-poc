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

function assessBasicInfo(truck: FoodTruck, issues: string[], currentScore: number): number {
  let score = currentScore;
  if (typeof truck.name !== 'string' || truck.name.trim().length === 0) {
    score -= 0.2;
    issues.push('Missing name');
  }
  if (typeof truck.description !== 'string' || truck.description.trim().length === 0) {
    score -= 0.1;
    issues.push('Missing description');
  }
  if (
    !Array.isArray(truck.cuisine_type) ||
    truck.cuisine_type.length === 0 ||
    !truck.cuisine_type.every((item) => typeof item === 'string')
  ) {
    score -= 0.1;
    issues.push('Missing or invalid cuisine type');
  }
  if (typeof truck.price_range !== 'string' || truck.price_range.trim().length === 0) {
    score -= 0.05;
    issues.push('Missing price range');
  }
  if (typeof truck.average_rating !== 'number' || Number.isNaN(truck.average_rating)) {
    score -= 0.05;
    issues.push('Missing average rating');
  }
  if (typeof truck.review_count !== 'number' || Number.isNaN(truck.review_count)) {
    score -= 0.05;
    issues.push('Missing review count');
  }
  return score;
}

function assessContactInfo(truck: FoodTruck, issues: string[], currentScore: number): number {
  let score = currentScore;
  if (typeof truck.website !== 'string' || truck.website.trim().length === 0) {
    score -= 0.05;
    issues.push('Missing website');
  }
  if (typeof truck.phone_number !== 'string' || truck.phone_number.trim().length === 0) {
    score -= 0.05;
    issues.push('Missing phone number');
  }
  if (typeof truck.email !== 'string' || truck.email.trim().length === 0) {
    score -= 0.05;
    issues.push('Missing email');
  }
  if (typeof truck.instagram_handle !== 'string' || truck.instagram_handle.trim().length === 0) {
    score -= 0.02;
    issues.push('Missing Instagram handle');
  }
  if (typeof truck.facebook_handle !== 'string' || truck.facebook_handle.trim().length === 0) {
    score -= 0.02;
    issues.push('Missing Facebook handle');
  }
  if (typeof truck.twitter_handle !== 'string' || truck.twitter_handle.trim().length === 0) {
    score -= 0.02;
    issues.push('Missing Twitter handle');
  }
  return score;
}

function assessLocationData(truck: FoodTruck, issues: string[], currentScore: number): number {
  let score = currentScore;
  if (
    typeof truck.current_location?.lat !== 'number' ||
    Number.isNaN(truck.current_location.lat) ||
    typeof truck.current_location?.lng !== 'number' ||
    Number.isNaN(truck.current_location.lng)
  ) {
    score -= 0.15;
    issues.push('Missing current location data');
  } else {
    if (
      typeof truck.current_location.timestamp === 'string' &&
      truck.current_location.timestamp.length > 0
    ) {
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
  return score;
}

function assessScheduleData(truck: FoodTruck, issues: string[], currentScore: number): number {
  let score = currentScore;
  if (!Array.isArray(truck.schedule) || truck.schedule.length === 0) {
    score -= 0.1;
    issues.push('Missing schedule data');
  }
  return score;
}

export function calculateQualityScore(truck: FoodTruck): QualityAssessment {
  let score = 1; // Start with a perfect score
  const issues: string[] = [];

  score = assessBasicInfo(truck, issues, score);
  score = assessContactInfo(truck, issues, score);
  score = assessLocationData(truck, issues, score);
  score = assessScheduleData(truck, issues, score);

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

  async batchUpdateQualityScores(
    limit: number = 100,
  ): Promise<{ updatedCount: number; errors: string[] }> {
    const { data, error } = await supabase
      .from('food_trucks')
      .select('*')
      .limit(limit)
      .overrideTypes<FoodTruck[]>();

    if (error) {
      console.error('Error fetching trucks for batch update:', error);
      return { updatedCount: 0, errors: [error.message] };
    }

    const trucks: FoodTruck[] = data ?? [];

    const updates = trucks.map((truck: FoodTruck) => {
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
      .select('*')
      .eq('id', truckId)
      .single()
      .overrideTypes<FoodTruck>();

    if (fetchError || truck === null) {
      console.error(`Error fetching truck ${truckId} for quality update:`, fetchError);
      return { success: false };
    }

    const { score } = calculateQualityScore(truck as FoodTruck);

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
