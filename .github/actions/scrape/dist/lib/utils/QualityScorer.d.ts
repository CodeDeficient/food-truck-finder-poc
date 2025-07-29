export interface QualityAssessment {
    score: number;
    issues: string[];
}
export type QualityCategory = {
    label: string;
    color: string;
};
/**
 * Computes the quality score of a given food truck based on multiple criteria.
 * @example
 * calculateQualityScore(truckInstance)
 * { score: 3, issues: ["Missing contact information", "Incomplete schedule"] }
 * @param {FoodTruck} truck - The food truck object to be assessed.
 * @returns {QualityAssessment} An object containing the computed score and a list of identified issues.
 * @description
 *   - The score starts at 1 and is adjusted based on various assessments.
 *   - The function ensures the score never drops below zero.
 *   - Issues that affect the score are collected and returned for analysis.
 */
export declare function calculateQualityScore(truck: FoodTruck): QualityAssessment;
export declare function categorizeQualityScore(score: number): QualityCategory;
export declare function formatQualityScore(score: number | null | undefined): string;
export declare function getQualityBadgeClasses(score: number | null | undefined): string;
export declare function getQualityScoreAriaLabel(score: number | null | undefined): string;
export declare const DataQualityService: {
    calculateQualityScore: typeof calculateQualityScore;
    categorizeQualityScore: typeof categorizeQualityScore;
    formatQualityScore: typeof formatQualityScore;
    getQualityBadgeClasses: typeof getQualityBadgeClasses;
    getQualityScoreAriaLabel: typeof getQualityScoreAriaLabel;
    batchUpdateQualityScores(limit?: number): Promise<{
        updatedCount: number;
        errors: string[];
    }>;
    updateTruckQualityScore(truckId: string): Promise<{
        success: boolean;
    }>;
};
