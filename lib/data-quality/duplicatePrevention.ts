/**
 * SOTA Duplicate Prevention System
 * Implements intelligent duplicate detection and prevention for food truck data
 */

import { FoodTruckService, type FoodTruck } from '../supabase.js';

// Duplicate detection configuration
export const DUPLICATE_DETECTION_CONFIG = {
  // Similarity thresholds (0.0 = no match, 1.0 = exact match)
  thresholds: {
    name: 0.85, // High threshold for name matching
    location: 0.9, // Very high threshold for location matching
    phone: 1, // Exact match for phone numbers
    website: 1, // Exact match for websites
    overall: 0.8, // Overall similarity threshold
  },

  // Weight factors for different fields
  weights: {
    name: 0.4, // 40% weight for name similarity
    location: 0.3, // 30% weight for location similarity
    contact: 0.2, // 20% weight for contact info similarity
    menu: 0.1, // 10% weight for menu similarity
  },
} as const;

export interface DuplicateMatch {
  existingTruck: FoodTruck;
  similarity: number;
  matchedFields: string[];
  confidence: 'high' | 'medium' | 'low';
  recommendation: 'merge' | 'update' | 'skip' | 'manual_review';
}

export interface DuplicateDetectionResult {
  isDuplicate: boolean;
  matches: DuplicateMatch[];
  bestMatch?: DuplicateMatch;
  action: 'create' | 'update' | 'merge' | 'manual_review';
  reason: string;
}

/**
 * Advanced Duplicate Prevention Service
 */
export class DuplicatePreventionService {
  /**
   * Check if a food truck is a duplicate of existing trucks
   */
  static async checkForDuplicates(
    candidateTruck: Partial<FoodTruck>,
  ): Promise<DuplicateDetectionResult> {
    try {
      // Get all existing trucks for comparison
      const existingTrucksResult = await FoodTruckService.getAllTrucks();

      if ('error' in existingTrucksResult) {
        console.error('Error fetching existing trucks:', existingTrucksResult.error);
        return {
          isDuplicate: false,
          matches: [],
          action: 'create',
          reason: `Error fetching existing trucks: ${existingTrucksResult.error}`,
        };
      }

      const existingTrucks = existingTrucksResult.trucks;
      const matches: DuplicateMatch[] = [];

      for (const existingTruck of existingTrucks) {
        console.log(`Checking existing truck with ID: ${existingTruck.id}`);
        const similarity = this.calculateSimilarity(candidateTruck, existingTruck);

        if (similarity.overall >= DUPLICATE_DETECTION_CONFIG.thresholds.overall) {
          matches.push({
            existingTruck,
            similarity: similarity.overall,
            matchedFields: similarity.matchedFields,
            confidence: this.getConfidenceLevel(similarity.overall),
            recommendation: this.getRecommendation(similarity),
          });
        }
      }

      return this.processDuplicateMatches(matches, candidateTruck);
    } catch (error) {
      console.error('Error checking for duplicates:', error);
      return {
        isDuplicate: false,
        matches: [],
        action: 'create',
        reason:
          'An unexpected error occurred during duplicate detection - proceeding with creation',
      };
    }
  }

  /**
   * Processes the matches found during duplicate detection and returns the result.
   */
  private static processDuplicateMatches(
    matches: DuplicateMatch[],
    candidateTruck: Partial<FoodTruck>,
  ): DuplicateDetectionResult {
    // Sort matches by similarity (highest first)
    matches.sort((a, b) => b.similarity - a.similarity);

    const bestMatch = matches.length > 0 ? matches[0] : undefined;
    const isDuplicate = matches.length > 0;

    return {
      isDuplicate,
      matches,
      bestMatch,
      action: this.determineAction(matches, candidateTruck),
      reason: this.generateReason(matches, candidateTruck),
    };
  }

  /**
   * Calculate similarity between two food trucks
   */
  private static calculateSimilarity(
    candidate: Partial<FoodTruck>,
    existing: FoodTruck,
  ): { overall: number; matchedFields: string[]; breakdown: Record<string, number> } {
    const breakdown: Record<string, number> = {};
    const matchedFields: string[] = [];

    // Name similarity
    const nameSimilarity = this.calculateStringSimilarity(
      candidate.name ?? '',
      existing.name ?? '',
    );
    breakdown.name = nameSimilarity;
    if (nameSimilarity >= DUPLICATE_DETECTION_CONFIG.thresholds.name) {
      matchedFields.push('name');
    }

    // Location similarity
    const locationSimilarity = this.calculateLocationSimilarity(
      candidate.current_location,
      existing.current_location,
    );
    breakdown.location = locationSimilarity;
    if (locationSimilarity >= DUPLICATE_DETECTION_CONFIG.thresholds.location) {
      matchedFields.push('location');
    }

    // Contact similarity
    const contactSimilarity = this.calculateContactSimilarity(
      candidate.contact_info,
      existing.contact_info,
    );
    breakdown.contact = contactSimilarity;
    if (contactSimilarity >= DUPLICATE_DETECTION_CONFIG.thresholds.phone) {
      matchedFields.push('contact');
    }

    // Menu similarity (basic)
    const menuSimilarity = this.calculateMenuSimilarity(candidate.menu, existing.menu);
    breakdown.menu = menuSimilarity;
    if (menuSimilarity > 0.7) {
      matchedFields.push('menu');
    }

    // Calculate weighted overall similarity
    const overall =
      nameSimilarity * DUPLICATE_DETECTION_CONFIG.weights.name +
      locationSimilarity * DUPLICATE_DETECTION_CONFIG.weights.location +
      contactSimilarity * DUPLICATE_DETECTION_CONFIG.weights.contact +
      menuSimilarity * DUPLICATE_DETECTION_CONFIG.weights.menu;

    return { overall, matchedFields, breakdown };
  }

  /**
   * Normalize food truck names for better comparison
   * Removes common suffixes, normalizes case, handles punctuation variations
   */
  private static normalizeFoodTruckName(name: string): string {
    if (!name) return '';

    return name
      .toLowerCase()
      .trim()
      // Normalize apostrophes (handle different Unicode apostrophes)
      .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")
      // Remove common food truck suffixes/prefixes
      .replace(/\s*\b(food\s+truck|food\s+trailer|mobile\s+kitchen|street\s+food|food\s+cart)\b\s*/gi, '')
      // Remove extra whitespace and normalize punctuation
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s&'-]/g, '')
      .trim();
  }

  /**
   * Calculate string similarity using Levenshtein distance with enhanced food truck name handling
   */
  private static calculateStringSimilarity(str1: string, str2: string): number {
    if (!str1 || !str2) return 0;

    // Normalize food truck names for better comparison
    const normalized1 = this.normalizeFoodTruckName(str1);
    const normalized2 = this.normalizeFoodTruckName(str2);

    if (normalized1 === normalized2) return 1;

    // Also check if one is a substring of the other (for cases like "Page's Okra Grill" vs "Page's Okra Grill Food Truck")
    const isSubstring = normalized1.includes(normalized2) || normalized2.includes(normalized1);
    if (isSubstring && (normalized1.length > 0 && normalized2.length > 0)) {
      const minLength = Math.min(normalized1.length, normalized2.length);
      const maxLength = Math.max(normalized1.length, normalized2.length);
      // High similarity for substring matches (0.8 to 0.95 based on length ratio)
      return 0.8 + (0.15 * (minLength / maxLength));
    }

    // Calculate Levenshtein distance on normalized strings
    const matrix: number[][] = [];
    const len1 = normalized1.length;
    const len2 = normalized2.length;

    for (let i = 0; i <= len1; i+=1) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= len2; j+=1) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= len1; i+=1) {
      // eslint-disable-next-line sonarjs/no-redundant-assignments
      for (let j = 1; j <= len2; j+=1) {
        const cost = normalized1[i - 1] === normalized2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost, // substitution
        );
      }
    }

    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);

    return maxLength === 0 ? 1 : 1 - distance / maxLength;
  }

  /**
   * Calculate location similarity
   */
  private static calculateLocationSimilarity(
    loc1: FoodTruck['current_location'] | undefined | null,
    loc2: FoodTruck['current_location'] | undefined | null,
  ): number {
    if (!loc1 || !loc2) return 0;

    let similarity = 0;
    let factors = 0;

    // Address similarity
    if (loc1.address && loc2.address) {
      similarity += this.calculateStringSimilarity(loc1.address, loc2.address);
      factors+=1;
    }

    // GPS coordinate similarity (within 100 meters = high similarity)
    if (loc1.lat && loc1.lng && loc2.lat && loc2.lng) {
      const distance = this.calculateGPSDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);

      // Distance similarity (closer = higher similarity)
      const distanceSimilarity = distance <= 0.1 ? 1 : Math.max(0, 1 - distance / 1); // 1km max
      similarity += distanceSimilarity;
      factors+=1;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  /**
   * Calculate GPS distance in kilometers
   */
  private static calculateGPSDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Calculate contact similarity
   */
  private static calculateContactSimilarity(
    contact1: FoodTruck['contact_info'] | undefined | null,
    contact2: FoodTruck['contact_info'] | undefined | null,
  ): number {
    if (!contact1 || !contact2) return 0;

    let matches = 0;
    let total = 0;

    // Phone number exact match
    if (contact1.phone != undefined && contact2.phone != undefined) {
      const phone1 = contact1.phone.replaceAll(/\D/g, ''); // Remove non-digits
      const phone2 = contact2.phone.replaceAll(/\D/g, '');
      if (phone1 === phone2) matches+=1;
      total+=1;
    }

    // Website exact match
    if (contact1.website != undefined && contact2.website != undefined) {
      const url1 = contact1.website
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
      const url2 = contact2.website
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/$/, '');
      if (url1 === url2) matches+=1;
      total+=1;
    }

    // Email similarity
    if (contact1.email != undefined && contact2.email != undefined) {
      if (contact1.email.toLowerCase() === contact2.email.toLowerCase()) matches+=1;
      total+=1;
    }

    return total > 0 ? matches / total : 0;
  }

  /**
   * Calculate menu similarity (basic implementation)
   */
  private static calculateMenuSimilarity(
    menu1: FoodTruck['menu'] | undefined | null,
    menu2: FoodTruck['menu'] | undefined | null,
  ): number {
    if (!menu1 || !menu2 || menu1.length === 0 || menu2.length === 0) return 0;

    // Simple category name matching
    const categories1 = menu1
      .map((cat) => (cat as { category?: string }).category?.toLowerCase() ?? '')
      .filter(Boolean);
    const categories2 = menu2
      .map((cat) => (cat as { category?: string }).category?.toLowerCase() ?? '')
      .filter(Boolean);

    const commonCategories = categories1.filter((cat) => categories2.includes(cat));
    const totalCategories = new Set([...categories1, ...categories2]).size;

    return totalCategories > 0 ? commonCategories.length / totalCategories : 0;
  }

  /**
   * Get confidence level based on similarity score
   */
  private static getConfidenceLevel(similarity: number): 'high' | 'medium' | 'low' {
    if (similarity >= 0.95) return 'high';
    if (similarity >= 0.85) return 'medium';
    return 'low';
  }

  /**
   * Get recommendation based on similarity analysis
   */
  private static getRecommendation(similarity: {
    overall: number;
    matchedFields: string[];
  }): 'merge' | 'update' | 'skip' | 'manual_review' {
    if (similarity.overall >= 0.95) return 'merge';
    if (similarity.overall >= 0.9) return 'update';
    if (similarity.overall >= 0.8) return 'manual_review';
    return 'skip';
  }

  /**
   * Determine action based on matches
   */
  private static determineAction(
    matches: DuplicateMatch[],
    _candidate: Partial<FoodTruck>,
  ): 'create' | 'update' | 'merge' | 'manual_review' {
    if (matches.length === 0) return 'create';

    const bestMatch = matches[0];

    if (bestMatch.confidence === 'high') {
      const {recommendation} = bestMatch;
      if (recommendation === 'merge' || recommendation === 'update') {
        return recommendation;
      }
      return 'manual_review';
    }

    return 'manual_review';
  }

  /**
   * Generate human-readable reason
   */
  private static generateReason(matches: DuplicateMatch[], _candidate: Partial<FoodTruck>): string {
    if (matches.length === 0) {
      return 'No duplicates found - safe to create new truck entry';
    }

    const bestMatch = matches[0];
    const similarity = Math.round(bestMatch.similarity * 100);

    return `Found ${matches.length} potential duplicate(s). Best match: ${similarity}% similarity with "${bestMatch.existingTruck.name}" (matched: ${bestMatch.matchedFields.join(', ')})`;
  }

  /**
   * Merge duplicate truck data intelligently
   */
  static async mergeDuplicates(
    targetId: string,
    sourceId: string,
  ): Promise<FoodTruck | { error: string }> {
    const targetResult = await FoodTruckService.getTruckById(targetId);
    const sourceResult = await FoodTruckService.getTruckById(sourceId);

    if ('error' in targetResult) {
      return {
        error: `Failed to retrieve target truck with ID ${targetId}: ${targetResult.error}`,
      };
    }
    if ('error' in sourceResult) {
      return {
        error: `Failed to retrieve source truck with ID ${sourceId}: ${sourceResult.error}`,
      };
    }

    const target = targetResult;
    const source = sourceResult;

    // Merge logic: prefer non-null, more complete data
    const mergedData: Partial<FoodTruck> = {
      name: target.name ?? source.name,
      description: target.description ?? source.description,
      cuisine_type:
        (target.cuisine_type?.length ?? 0) > 0 ? target.cuisine_type : source.cuisine_type,
      price_range: target.price_range ?? source.price_range,
      current_location: target.current_location ?? source.current_location,
      contact_info: {
        ...source.contact_info,
        ...target.contact_info, // Target takes precedence
      },
      operating_hours: target.operating_hours ?? source.operating_hours,
      menu: (target.menu?.length ?? 0) > 0 ? target.menu : source.menu,
      social_media: {
        ...source.social_media,
        ...target.social_media,
      },
      source_urls: Array.from(new Set([...(target.source_urls ?? []), ...(source.source_urls ?? [])])),
      last_scraped_at: new Date().toISOString(),
    };

    // Update target with merged data
    const updatedTruckResult = await FoodTruckService.updateTruck(targetId, mergedData);

    if ('error' in updatedTruckResult) {
      return {
        error: `Failed to update target truck with merged data: ${updatedTruckResult.error}`,
      };
    }

    console.info(`Merged truck ${sourceId} into ${targetId}`);

    return updatedTruckResult;
  }

  /**
   * Check if a food truck name already exists in the database to prevent duplicate scraping
   * This is used for early duplicate detection before processing scraping jobs to save API resources
   * @param truckName - The name of the food truck to check
   * @returns Object with isDuplicate flag and reason
   */
  static async isDuplicateUrl(truckName: string): Promise<{ isDuplicate: boolean; reason: string }> {
    try {
      // Use existing FoodTruckService to get all trucks
      const existingTrucksResult = await FoodTruckService.getAllTrucks();

      if ('error' in existingTrucksResult) {
        console.warn('Error fetching existing trucks for duplicate check:', existingTrucksResult.error);
        return { isDuplicate: false, reason: 'Error checking database' };
      }

      const existingTrucks = existingTrucksResult.trucks;

      // Check for similar names using existing normalization and similarity logic
      for (const existingTruck of existingTrucks) {
        const similarity = this.calculateStringSimilarity(truckName, existingTruck.name ?? '');
        
        // Use a high threshold to avoid false positives with "food truck" in names
        if (similarity >= 0.95) {
          return { 
            isDuplicate: true, 
            reason: `Similar truck name already exists: "${existingTruck.name}" (${Math.round(similarity * 100)}% similar)` 
          };
        }
      }

      return { isDuplicate: false, reason: 'No similar truck names found' };
    } catch (error) {
      console.warn('Error in isDuplicateUrl check:', error);
      return { isDuplicate: false, reason: 'Error during duplicate check' };
    }
  }
}
