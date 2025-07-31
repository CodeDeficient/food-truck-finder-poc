/**
 * SOTA Duplicate Prevention System
 * Implements intelligent duplicate detection and prevention for food truck data
 */
import { type FoodTruck } from '../supabase.js';
export declare const DUPLICATE_DETECTION_CONFIG: {
    readonly thresholds: {
        readonly name: 0.85;
        readonly location: 0.9;
        readonly phone: 1;
        readonly website: 1;
        readonly overall: 0.8;
    };
    readonly weights: {
        readonly name: 0.4;
        readonly location: 0.3;
        readonly contact: 0.2;
        readonly menu: 0.1;
    };
};
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
export declare class DuplicatePreventionService {
    /**
     * Check if a food truck is a duplicate of existing trucks
     */
    static checkForDuplicates(candidateTruck: Partial<FoodTruck>): Promise<DuplicateDetectionResult>;
    /**
     * Processes the matches found during duplicate detection and returns the result.
     */
    private static processDuplicateMatches;
    /**
     * Calculate similarity between two food trucks
     */
    private static calculateSimilarity;
    /**
     * Normalize food truck names for better comparison
     * Removes common suffixes, normalizes case, handles punctuation variations
     */
    private static normalizeFoodTruckName;
    /**
     * Calculate string similarity using Levenshtein distance with enhanced food truck name handling
     */
    private static calculateStringSimilarity;
    /**
     * Calculate location similarity
     */
    private static calculateLocationSimilarity;
    /**
     * Calculate GPS distance in kilometers
     */
    private static calculateGPSDistance;
    /**
     * Calculate contact similarity
     */
    private static calculateContactSimilarity;
    /**
     * Calculate menu similarity (basic implementation)
     */
    private static calculateMenuSimilarity;
    /**
     * Get confidence level based on similarity score
     */
    private static getConfidenceLevel;
    /**
     * Get recommendation based on similarity analysis
     */
    private static getRecommendation;
    /**
     * Determine action based on matches
     */
    private static determineAction;
    /**
     * Generate human-readable reason
     */
    private static generateReason;
    /**
     * Merge duplicate truck data intelligently
     */
    static mergeDuplicates(targetId: string, sourceId: string): Promise<FoodTruck | {
        error: string;
    }>;
    /**
     * Check if a food truck name already exists in the database to prevent duplicate scraping
     * This is used for early duplicate detection before processing scraping jobs to save API resources
     * @param truckName - The name of the food truck to check
     * @returns Object with isDuplicate flag and reason
     */
    static isDuplicateUrl(truckName: string): Promise<{
        isDuplicate: boolean;
        reason: string;
    }>;
}
