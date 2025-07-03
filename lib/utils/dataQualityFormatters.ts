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

// SOTA quality thresholds based on industry standards
export const QUALITY_THRESHOLDS: QualityThresholds = {
  high: 0.8, // 80%+ = High quality
  medium: 0.6, // 60-79% = Medium quality
  low: 0.6, // <60% = Low quality
};

// SOTA color scheme for accessibility and visual hierarchy
export const QUALITY_CATEGORIES: Record<string, QualityCategory> = {
  high: {
    label: 'High',
    color: '#22c55e',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
  },
  medium: {
    label: 'Medium',
    color: '#f59e0b',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
  },
  low: {
    label: 'Low',
    color: '#ef4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
  },
};

/**
 * Formats a quality score as a percentage with proper precision
 * @param score - Quality score (0-1 range)
 * @param precision - Number of decimal places (default: 1)
 * @returns Formatted percentage string
 */
export function formatQualityScore(
  score: number | null | undefined,
  precision: number = 1,
): string {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return 'N/A';
  }

  // Ensure score is in 0-1 range
  const normalizedScore = Math.max(0, Math.min(1, score));
  return `${(normalizedScore * 100).toFixed(precision)}%`;
}

/**
 * Categorizes a quality score into high/medium/low categories
 * @param score - Quality score (0-1 range)
 * @returns Quality category object
 */
export function categorizeQualityScore(score: number | null | undefined): QualityCategory {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return QUALITY_CATEGORIES.low;
  }

  if (score >= QUALITY_THRESHOLDS.high) {
    return QUALITY_CATEGORIES.high;
  } else if (score >= QUALITY_THRESHOLDS.medium) {
    return QUALITY_CATEGORIES.medium;
  } else {
    return QUALITY_CATEGORIES.low;
  }
}

/**
 * Gets the appropriate CSS classes for a quality score badge
 * @param score - Quality score (0-1 range)
 * @returns CSS class string for badge styling
 */
export function getQualityBadgeClasses(score: number | null | undefined): string {
  const category = categorizeQualityScore(score);
  return `${category.bgColor} ${category.textColor}`;
}

/**
 * Calculates quality score trend indicator
 * @param currentScore - Current quality score
 * @param previousScore - Previous quality score
 * @returns Trend object with direction and percentage change
 */
export function calculateQualityTrend(
  currentScore: number | null | undefined,
  previousScore: number | null | undefined,
): {
  direction: 'up' | 'down' | 'stable' | 'unknown';
  change: number;
  changeText: string;
} {
  if (currentScore == undefined || previousScore == undefined) {
    return {
      direction: 'unknown',
      change: 0,
      changeText: 'N/A',
    };
  }

  const change = currentScore - previousScore;
  const changePercentage = Math.abs(change * 100);

  if (Math.abs(change) < 0.01) {
    // Less than 1% change
    return {
      direction: 'stable',
      change: 0,
      changeText: 'No change',
    };
  }

  return {
    direction: change > 0 ? 'up' : 'down',
    change: changePercentage,
    changeText: `${change > 0 ? '+' : '-'}${changePercentage.toFixed(1)}%`,
  };
}

/**
 * Generates quality improvement suggestions based on score
 * @param score - Quality score (0-1 range)
 * @returns Array of improvement suggestions
 */
export function getQualityImprovementSuggestions(score: number | null | undefined): string[] {
  if (score == undefined || score >= QUALITY_THRESHOLDS.high) {
    return ['Quality score is excellent! Continue maintaining data standards.'];
  }

  const suggestions: string[] = [];

  if (score < QUALITY_THRESHOLDS.medium) {
    suggestions.push(
      'Critical: Add missing core information (name, location, contact details)',
      'Verify and update GPS coordinates for accurate location data',
      'Add comprehensive menu information and pricing',
      'Update operating hours and schedule information',
    );
  } else {
    suggestions.push(
      'Add missing optional fields (website, social media, ratings)',
      'Enhance menu descriptions and categories',
      'Update recent photos and promotional content',
      'Verify contact information accuracy',
    );
  }

  return suggestions;
}

/**
 * Formats quality statistics for display
 * @param stats - Raw quality statistics from database
 * @returns Formatted statistics object
 */
export function formatQualityStats(stats: {
  total_trucks: number;
  avg_quality_score: number;
  high_quality_count: number;
  medium_quality_count: number;
  low_quality_count: number;
  verified_count: number;
  pending_count: number;
  flagged_count: number;
}) {
  return {
    totalTrucks: stats.total_trucks,
    averageScore: formatQualityScore(stats.avg_quality_score),
    averageScoreRaw: stats.avg_quality_score,
    distribution: {
      high: {
        count: stats.high_quality_count,
        percentage: ((stats.high_quality_count / stats.total_trucks) * 100).toFixed(1),
      },
      medium: {
        count: stats.medium_quality_count,
        percentage: ((stats.medium_quality_count / stats.total_trucks) * 100).toFixed(1),
      },
      low: {
        count: stats.low_quality_count,
        percentage: ((stats.low_quality_count / stats.total_trucks) * 100).toFixed(1),
      },
    },
    verification: {
      verified: {
        count: stats.verified_count,
        percentage: ((stats.verified_count / stats.total_trucks) * 100).toFixed(1),
      },
      pending: {
        count: stats.pending_count,
        percentage: ((stats.pending_count / stats.total_trucks) * 100).toFixed(1),
      },
      flagged: {
        count: stats.flagged_count,
        percentage: ((stats.flagged_count / stats.total_trucks) * 100).toFixed(1),
      },
    },
  };
}

/**
 * Validates if a quality score is within acceptable range
 * @param score - Quality score to validate
 * @returns Boolean indicating if score is valid
 */
export function isValidQualityScore(score: number | null | undefined): boolean {
  return typeof score === 'number' && !Number.isNaN(score) && score >= 0 && score <= 1;
}

/**
 * Generates accessibility-friendly description for quality score
 * @param score - Quality score (0-1 range)
 * @returns Screen reader friendly description
 */
export function getQualityScoreAriaLabel(score: number | null | undefined): string {
  if (!isValidQualityScore(score)) {
    return 'Quality score not available';
  }

  const category = categorizeQualityScore(score);
  const percentage = formatQualityScore(score);

  return `Data quality score: ${percentage}, categorized as ${category.label.toLowerCase()} quality`;
}
