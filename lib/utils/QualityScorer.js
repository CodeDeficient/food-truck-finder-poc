import { supabase } from '../../lib/supabase.js';
/**
 * Assess basic information of a FoodTruck object and adjust its score based on missing attributes.
 * @example
 * assessBasicInfo({name: 'Taste', description: 'Good food', cuisine_type: ['Italian'], price_range: '$$', average_rating: 4.5, review_count: 100}, [], 1.0)
 * Returns 1.0 if the truck information is complete and correct, otherwise returns a lower score with issues noted in the issues array.
 * @param {FoodTruck} truck - Object containing details about the food truck.
 * @param {string[]} issues - Array to hold descriptions of any issues found in the truck's information.
 * @param {number} currentScore - Initial score from which deductions are made based on detected issues.
 * @returns {number} Updated score after assessing the truck's basic information.
 * @description
 *   - Reduces score for missing or invalid 'name', 'description', 'cuisine_type', 'price_range', 'average_rating', and 'review_count'.
 *   - Appends issue descriptions to the 'issues' array corresponding to each attribute that fails validation.
 */
function assessBasicInfo(truck, issues, currentScore) {
    let score = currentScore;
    if (typeof truck.name !== 'string' || truck.name.trim().length === 0) {
        score -= 0.2;
        issues.push('Missing name');
    }
    if (typeof truck.description !== 'string' || truck.description.trim().length === 0) {
        score -= 0.1;
        issues.push('Missing description');
    }
    if (!Array.isArray(truck.cuisine_type) ||
        truck.cuisine_type.length === 0 ||
        !truck.cuisine_type.every((item) => typeof item === 'string')) {
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
/**
 * Evaluates the contact information of a food truck and modifies its score accordingly.
 * @example
 * assessContactInfo(truckInstance, [], 1.0)
 * // returns 0.88 if all arguments are missing
 * @param {FoodTruck} truck - An object representing a food truck with various contact attributes.
 * @param {string[]} issues - An array to store any identified issues with contact information.
 * @param {number} currentScore - The initial score before evaluation.
 * @returns {number} A modified score based on the presence and validity of contact details.
 * @description
 *   - Reduces the score by a small percentage for each missing contact detail.
 *   - Appends specific issue messages to the 'issues' array for each missing detail.
 *   - Scores attribute presence in descending impact order: website, phone number, email, social media handles.
 */
function assessContactInfo(truck, issues, currentScore) {
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
/**
 * Evaluates the quality of location data for a food truck and updates the score accordingly.
 * @example
 * assessLocationData(truck, issues, currentScore)
 * // Returns a modified score based on location data analysis
 * @param {FoodTruck} truck - The food truck object containing location details.
 * @param {string[]} issues - Array to record any issues identified during evaluation.
 * @param {number} currentScore - The current scoring value before assessment.
 * @returns {number} Updated score reflecting the quality of the location data.
 * @description
 *   - Reduces the score if location data is missing or invalid.
 *   - Checks the age of the location data to determine its staleness.
 *   - Updates the issues array with specific reasons when penalizing the score.
 */
function assessLocationData(truck, issues, currentScore) {
    let score = currentScore;
    if (typeof truck.current_location?.lat !== 'number' ||
        Number.isNaN(truck.current_location.lat) ||
        typeof truck.current_location?.lng !== 'number' ||
        Number.isNaN(truck.current_location.lng)) {
        score -= 0.15;
        issues.push('Missing current location data');
    }
    else {
        if (typeof truck.current_location.timestamp === 'string' &&
            truck.current_location.timestamp.length > 0) {
            const locationAge = Date.now() - new Date(truck.current_location.timestamp).getTime();
            const daysSinceUpdate = locationAge / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate > 7) {
                score -= 0.1;
                issues.push('Stale location data');
            }
        }
        else {
            score -= 0.05;
            issues.push('Missing location timestamp');
        }
    }
    return score;
}
function assessScheduleData(truck, issues, currentScore) {
    let score = currentScore;
    if (!Array.isArray(truck.schedule) || truck.schedule.length === 0) {
        score -= 0.1;
        issues.push('Missing schedule data');
    }
    return score;
}
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
export function calculateQualityScore(truck) {
    let score = 1; // Start with a perfect score
    const issues = [];
    score = assessBasicInfo(truck, issues, score);
    score = assessContactInfo(truck, issues, score);
    score = assessLocationData(truck, issues, score);
    score = assessScheduleData(truck, issues, score);
    // Ensure score doesn't go below 0
    score = Math.max(0, score);
    return { score, issues };
}
export function categorizeQualityScore(score) {
    if (score >= 0.8) {
        return { label: 'High', color: 'bg-green-500' };
    }
    else if (score >= 0.5) {
        return { label: 'Medium', color: 'bg-yellow-500' };
    }
    return { label: 'Low', color: 'bg-red-500' };
}
export function formatQualityScore(score) {
    if (score === null || score === undefined) {
        return 'N/A';
    }
    return `${(score * 100).toFixed(0)}%`;
}
export function getQualityBadgeClasses(score) {
    if (score === null || score === undefined) {
        return 'bg-gray-500';
    }
    const category = categorizeQualityScore(score);
    return category.color;
}
export function getQualityScoreAriaLabel(score) {
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
    async batchUpdateQualityScores(limit = 100) {
        const { data, error } = await supabase
            .from('food_trucks')
            .select('*')
            .limit(limit)
            .overrideTypes();
        if (error) {
            console.error('Error fetching trucks for batch update:', error);
            return { updatedCount: 0, errors: [error.message] };
        }
        const trucks = data ?? [];
        const updates = trucks.map((truck) => {
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
    async updateTruckQualityScore(truckId) {
        const { data: truck, error: fetchError } = await supabase
            .from('food_trucks')
            .select('*')
            .eq('id', truckId)
            .single()
            .overrideTypes();
        if (fetchError || truck === null) {
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
