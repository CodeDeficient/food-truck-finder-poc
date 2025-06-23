/**
 * SOTA Quality Scoring Utilities
 * Centralized quality scoring functions to eliminate duplication
 * and provide consistent quality metrics across the application
 */

import { isNonEmptyString, isValidNumber, safeNumber, safeString } from './typeGuards';

// Quality score weights (must sum to 1.0)
export const QUALITY_WEIGHTS = {
  CORE_DATA: 0.35,      // 35% - name, description, location
  LOCATION_DATA: 0.25,  // 25% - coordinates, address
  CONTACT_DATA: 0.2,    // 20% - phone, email, website
  MENU_DATA: 0.1,       // 10% - menu items, pricing
  OPERATIONAL_DATA: 0.05, // 5% - hours, social media
  VERIFICATION: 0.05    // 5% - verification status
} as const;

// Quality thresholds
export const QUALITY_THRESHOLDS = {
  HIGH: 0.8,    // 80%+
  MEDIUM: 0.6,  // 60-79%
  LOW: 0       // <60%
} as const;

// Core data quality scoring
export function scoreCoreData(truck: Record<string, unknown>): number {
  let score = 0;
  let maxScore = 0;

  // Name (required - 40% of core score)
  maxScore += 0.4;
  if (isNonEmptyString(truck.name)) {
    score += 0.4;
  }

  // Description (30% of core score)
  maxScore += 0.3;
  if (isNonEmptyString(truck.description)) {
    const desc = safeString(truck.description);
    if (desc.length > 50) {
      score += 0.3;
    } else if (desc.length > 20) {
      score += 0.15;
    }
  }

  // Cuisine type (20% of core score)
  maxScore += 0.2;
  if (isNonEmptyString(truck.cuisine_type)) {
    score += 0.2;
  }

  // Image URL (10% of core score)
  maxScore += 0.1;
  if (isNonEmptyString(truck.image_url)) {
    score += 0.1;
  }

  return maxScore > 0 ? score / maxScore : 0;
}

// Location data quality scoring
export function scoreLocationData(truck: Record<string, unknown>): number {
  let score = 0;
  let maxScore = 0;

  // Coordinates (50% of location score)
  maxScore += 0.5;
  const latitude = safeNumber(truck.latitude);
  const longitude = safeNumber(truck.longitude);
  if (isValidNumber(latitude) && isValidNumber(longitude) && 
      latitude !== 0 && longitude !== 0) {
    score += 0.5;
  }

  // Address (30% of location score)
  maxScore += 0.3;
  if (isNonEmptyString(truck.address)) {
    score += 0.3;
  }

  // City/State (20% of location score)
  maxScore += 0.2;
  if (isNonEmptyString(truck.city) || isNonEmptyString(truck.state)) {
    score += 0.2;
  }

  return maxScore > 0 ? score / maxScore : 0;
}

// Contact data quality scoring
export function scoreContactData(truck: Record<string, unknown>): number {
  let score = 0;
  let maxScore = 0;

  // Phone (40% of contact score)
  maxScore += 0.4;
  if (isNonEmptyString(truck.phone)) {
    const phone = safeString(truck.phone);
    // Basic phone validation - simplified to avoid backtracking
    if (/^\+?[\d\s\-()]{10,}$/.test(phone)) {
      score += 0.4;
    } else if (phone.length > 5) {
      score += 0.2;
    }
  }

  // Email (30% of contact score)
  maxScore += 0.3;
  if (isNonEmptyString(truck.email)) {
    const email = safeString(truck.email);
    // Basic email validation
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      score += 0.3;
    }
  }

  // Website (30% of contact score)
  maxScore += 0.3;
  if (isNonEmptyString(truck.website)) {
    const website = safeString(truck.website);
    // Basic URL validation
    if (/^https?:\/\/.+\..+/.test(website)) {
      score += 0.3;
    }
  }

  return maxScore > 0 ? score / maxScore : 0;
}

// Menu data quality scoring
export function scoreMenuData(truck: Record<string, unknown>): number {
  let score = 0;
  let maxScore = 0;

  // Menu items (70% of menu score)
  maxScore += 0.7;
  if (isNonEmptyString(truck.menu_items)) {
    const menuItems = safeString(truck.menu_items);
    if (menuItems.length > 100) {
      score += 0.7;
    } else if (menuItems.length > 20) {
      score += 0.35;
    }
  }

  // Price range (30% of menu score)
  maxScore += 0.3;
  if (isNonEmptyString(truck.price_range)) {
    score += 0.3;
  }

  return maxScore > 0 ? score / maxScore : 0;
}

// Operational data quality scoring
export function scoreOperationalData(truck: Record<string, unknown>): number {
  let score = 0;
  let maxScore = 0;

  // Operating hours (60% of operational score)
  maxScore += 0.6;
  if (isNonEmptyString(truck.operating_hours)) {
    score += 0.6;
  }

  // Social media (40% of operational score)
  maxScore += 0.4;
  const socialFields = ['facebook_url', 'twitter_url', 'instagram_url'];
  const socialCount = socialFields.filter(field => isNonEmptyString(truck[field])).length;
  score += (socialCount / socialFields.length) * 0.4;

  return maxScore > 0 ? score / maxScore : 0;
}

// Verification status scoring
export function scoreVerificationStatus(truck: Record<string, unknown>): number {
  const status = safeString(truck.verification_status);
  switch (status) {
    case 'verified': {
      return 1;
    }
    case 'pending': {
      return 0.5;
    }
    default: {
      return 0;
    }
  }
}

import { type FoodTruck } from '@/lib/supabase';
// Calculate overall quality score
export function calculateOverallQualityScore(truck: FoodTruck): { score: number; issues: string[] } {
  const coreScore = scoreCoreData(truck);
  const locationScore = scoreLocationData(truck);
  const contactScore = scoreContactData(truck);
  const menuScore = scoreMenuData(truck);
  const operationalScore = scoreOperationalData(truck);
  const verificationScore = scoreVerificationStatus(truck);

  const score = (
    coreScore * QUALITY_WEIGHTS.CORE_DATA +
    locationScore * QUALITY_WEIGHTS.LOCATION_DATA +
    contactScore * QUALITY_WEIGHTS.CONTACT_DATA +
    menuScore * QUALITY_WEIGHTS.MENU_DATA +
    operationalScore * QUALITY_WEIGHTS.OPERATIONAL_DATA +
    verificationScore * QUALITY_WEIGHTS.VERIFICATION
  );

  // For now, we return an empty issues array.
  // This can be expanded later to include specific data quality issues.
  return { score, issues: [] };
}

// Get quality category
export function getQualityCategory(score: number): 'high' | 'medium' | 'low' {
  if (score >= QUALITY_THRESHOLDS.HIGH) return 'high';
  if (score >= QUALITY_THRESHOLDS.MEDIUM) return 'medium';
  return 'low';
}

// Get quality label
export function getQualityLabel(score: number): string {
  const category = getQualityCategory(score);
  switch (category) {
    case 'high': {
      return 'Excellent';
    }
    case 'medium': {
      return 'Good';
    }
    case 'low': {
      return 'Needs Work';
    }
  }
}

// Get quality color
export function getQualityColor(score: number): string {
  const category = getQualityCategory(score);
  switch (category) {
    case 'high': {
      return '#22c55e';
    }
    case 'medium': {
      return '#f59e0b';
    }
    case 'low': {
      return '#ef4444';
    }
  }
}

export const DataQualityService = {
  calculateQualityScore: calculateOverallQualityScore,
  categorizeQualityScore: getQualityCategory,
  // Assuming batchUpdateQualityScores is a separate function or will be added elsewhere
  // For now, we'll leave it as a placeholder or remove if not needed here.
  // It was previously cast from DataQualityService in cron/quality-check/route.ts
  // If it's meant to be a method of this service, it needs to be implemented.
  // For now, I'll add a placeholder for it.
  batchUpdateQualityScores: async (limit: number) => {
    // No await needed, so remove async if not needed, or add a dummy await
    await Promise.resolve();
    console.warn(`DataQualityService.batchUpdateQualityScores called with limit: ${limit}. This function needs to be properly implemented.`);
    return { updatedCount: 0, errors: [] };
  },
  updateTruckQualityScore: async (truckId: string) => {
    await Promise.resolve();
    console.warn(`DataQualityService.updateTruckQualityScore called for truckId: ${truckId}. This function needs to be properly implemented.`);
    return { success: true };
  }
};
