/**
 * SOTA Data Quality Formatting Utilities
 * Provides consistent formatting and categorization for data quality metrics
 */
export interface QualityThresholds {
    high: number;
    medium: number;
    low: number;
}
export interface QualityCategory {
    label: 'High' | 'Medium' | 'Low';
    color: string;
    bgColor: string;
    textColor: string;
}
export declare const QUALITY_THRESHOLDS: QualityThresholds;
export declare const QUALITY_CATEGORIES: Record<string, QualityCategory>;
/**
 * Formats a quality score as a percentage with proper precision
 * @param score - Quality score (0-1 range)
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export declare function formatQualityScore(score: number | null | undefined, precision?: number): string;
/**
 * Categorizes a quality score into high/medium/low categories
 * @param score - Quality score (0-1 range)
 * @returns Quality category object
 */
export declare function categorizeQualityScore(score: number | null | undefined): QualityCategory;
/**
 * Gets the appropriate CSS classes for a quality score badge
 * @param score - Quality score (0-1 range)
 * @returns CSS class string for badge styling
 */
export declare function getQualityBadgeClasses(score: number | null | undefined): string;
/**
 * Calculates quality score trend indicator
 * @param currentScore - Current quality score
 * @param previousScore - Previous quality score
 * @returns Trend object with direction and percentage change
 */
export declare function calculateQualityTrend(currentScore: number | null | undefined, previousScore: number | null | undefined): {
    direction: 'up' | 'down' | 'stable' | 'unknown';
    change: number;
    changeText: string;
};
/**
 * Generates quality improvement suggestions based on score
 * @param score - Quality score (0-1 range)
 * @returns Array of improvement suggestions
 */
export declare function getQualityImprovementSuggestions(score: number | null | undefined): string[];
/**
 * Formats quality statistics for display
 * @param stats - Raw quality statistics from database
 * @returns Formatted statistics object
 */
export declare function formatQualityStats(stats: {
    total_trucks: number;
    avg_quality_score: number;
    high_quality_count: number;
    medium_quality_count: number;
    low_quality_count: number;
    verified_count: number;
    pending_count: number;
    flagged_count: number;
}): {
    totalTrucks: number;
    averageScore: string;
    averageScoreRaw: number;
    distribution: {
        high: {
            count: number;
            percentage: string;
        };
        medium: {
            count: number;
            percentage: string;
        };
        low: {
            count: number;
            percentage: string;
        };
    };
    verification: {
        verified: {
            count: number;
            percentage: string;
        };
        pending: {
            count: number;
            percentage: string;
        };
        flagged: {
            count: number;
            percentage: string;
        };
    };
};
/**
 * Validates if a quality score is within acceptable range
 * @param score - Quality score to validate
 * @returns Boolean indicating if score is valid
 */
export declare function isValidQualityScore(score: number | null | undefined): boolean;
/**
 * Generates accessibility-friendly description for quality score
 * @param score - Quality score (0-1 range)
 * @returns Screen reader friendly description
 */
export declare function getQualityScoreAriaLabel(score: number | null | undefined): string;
