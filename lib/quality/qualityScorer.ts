import { FoodTruck } from '../supabase';

/**
 * Represents the result of a validation check
 */
export interface ValidationResult {
    critical: string[];
    warnings: string[];
    info: string[];
}

/**
 * Represents the quality score and grade for an entity
 */
export interface QualityScoreResult {
    score: number;
    grade: string;
    breakdown: {
        criticalPassed: number;
        warningsPassed: number;
        totalPossiblePoints: number;
        actualPoints: number;
    };
}

/**
 * Represents a validation rule
 */
interface ValidationRule {
    name: string;
    severity: 'critical' | 'warning' | 'info';
    points: number;
    check: (entity: FoodTruck) => boolean;
    message: string;
}

// Scoring rubric configuration
const SCORING_CONFIG = {
    CRITICAL_RULE_POINTS: 1.0,
    WARNING_RULE_POINTS: 0.5,
    INFO_RULE_POINTS: 0.1,
};

// Grade boundaries (percentage based)
const GRADE_BOUNDARIES = [
    { threshold: 90, grade: 'A' },
    { threshold: 80, grade: 'B' },
    { threshold: 70, grade: 'C' },
    { threshold: 60, grade: 'D' },
    { threshold: 0, grade: 'F' },
];

/**
 * Validation rules for FoodTruck entities
 * Based on the validation requirements YAML
 */
const VALIDATION_RULES: ValidationRule[] = [
    // Critical rules (errors)
    {
        name: 'truck_name_required',
        severity: 'critical',
        points: SCORING_CONFIG.CRITICAL_RULE_POINTS,
        check: (truck) => !!(truck.name && truck.name.trim().length > 0),
        message: 'Food truck name is required'
    },
    {
        name: 'truck_id_valid',
        severity: 'critical',
        points: SCORING_CONFIG.CRITICAL_RULE_POINTS,
        check: (truck) => !!(truck.id && truck.id.length > 0),
        message: 'Valid truck ID is required'
    },
    {
        name: 'name_format_valid',
        severity: 'critical',
        points: SCORING_CONFIG.CRITICAL_RULE_POINTS,
        check: (truck) => {
            if (!truck.name) return false;
            return /^[a-zA-Z0-9\s&'-]+$/.test(truck.name) && truck.name.length <= 100;
        },
        message: 'Food truck name must be valid format and under 100 characters'
    },
    
    // Warning rules
    {
        name: 'price_range_provided',
        severity: 'warning',
        points: SCORING_CONFIG.WARNING_RULE_POINTS,
        check: (truck) => {
            const validRanges = ['$', '$$', '$$$', '$$$$'];
            return truck.price_range ? validRanges.includes(truck.price_range) : false;
        },
        message: 'Price range should be provided ($, $$, $$$, or $$$$)'
    },
    {
        name: 'location_completeness',
        severity: 'warning',
        points: SCORING_CONFIG.WARNING_RULE_POINTS,
        check: (truck) => {
            const location = truck.current_location;
            if (location && typeof location === 'object' && 'lat' in location && 'lng' in location) {
                return !!('address' in location && location.address);
            }
            return false;
        },
        message: 'If coordinates are provided, address should also be provided'
    },
    {
        name: 'contact_info_provided',
        severity: 'warning',
        points: SCORING_CONFIG.WARNING_RULE_POINTS,
        check: (truck) => {
            return !!(truck.phone_number || truck.email || truck.website);
        },
        message: 'At least one contact method should be provided'
    },
    {
        name: 'cuisine_type_provided',
        severity: 'warning',
        points: SCORING_CONFIG.WARNING_RULE_POINTS,
        check: (truck) => {
            return Array.isArray(truck.cuisine_type) && truck.cuisine_type.length > 0;
        },
        message: 'Cuisine type should be specified'
    },
    
    // Info rules
    {
        name: 'description_provided',
        severity: 'info',
        points: SCORING_CONFIG.INFO_RULE_POINTS,
        check: (truck) => !!(truck.description && truck.description.trim().length > 0),
        message: 'Description improves truck discoverability'
    },
    {
        name: 'operating_hours_provided',
        severity: 'info',
        points: SCORING_CONFIG.INFO_RULE_POINTS,
        check: (truck) => {
            return !!(truck.operating_hours && Object.keys(truck.operating_hours).length > 0);
        },
        message: 'Operating hours help customers find you'
    },
    {
        name: 'social_media_provided',
        severity: 'info',
        points: SCORING_CONFIG.INFO_RULE_POINTS,
        check: (truck) => {
            return !!(truck.instagram_handle || truck.facebook_handle || truck.twitter_handle);
        },
        message: 'Social media handles increase customer engagement'
    },
    {
        name: 'menu_provided',
        severity: 'info',
        points: SCORING_CONFIG.INFO_RULE_POINTS,
        check: (truck) => {
            return Array.isArray(truck.menu) && truck.menu.length > 0;
        },
        message: 'Menu information helps customers make decisions'
    }
];

/**
 * Validates a FoodTruck entity against all defined rules
 */
export function validateEntity(entity: FoodTruck): ValidationResult {
    const result: ValidationResult = {
        critical: [],
        warnings: [],
        info: []
    };

    for (const rule of VALIDATION_RULES) {
        if (!rule.check(entity)) {
            switch (rule.severity) {
                case 'critical':
                    result.critical.push(rule.message);
                    break;
                case 'warning':
                    result.warnings.push(rule.message);
                    break;
                case 'info':
                    result.info.push(rule.message);
                    break;
            }
        }
    }

    return result;
}

/**
 * Calculates quality score based on validation results
 * Scoring rubric:
 * - 1 point per passed critical rule
 * - 0.5 points per passed warning rule  
 * - 0.1 points per passed info rule
 */
export function calculateQualityScore(entity: FoodTruck, validationResult?: ValidationResult): QualityScoreResult {
    // If no validation result provided, generate one
    const validation = validationResult || validateEntity(entity);
    
    // Calculate total possible points
    const criticalRules = VALIDATION_RULES.filter(r => r.severity === 'critical');
    const warningRules = VALIDATION_RULES.filter(r => r.severity === 'warning');
    const infoRules = VALIDATION_RULES.filter(r => r.severity === 'info');
    
    const totalPossiblePoints = 
        (criticalRules.length * SCORING_CONFIG.CRITICAL_RULE_POINTS) +
        (warningRules.length * SCORING_CONFIG.WARNING_RULE_POINTS) +
        (infoRules.length * SCORING_CONFIG.INFO_RULE_POINTS);
    
    // Calculate points earned (passed rules)
    const criticalPassed = criticalRules.length - validation.critical.length;
    const warningsPassed = warningRules.length - validation.warnings.length;
    const infoPassed = infoRules.length - validation.info.length;
    
    const actualPoints = 
        (criticalPassed * SCORING_CONFIG.CRITICAL_RULE_POINTS) +
        (warningsPassed * SCORING_CONFIG.WARNING_RULE_POINTS) +
        (infoPassed * SCORING_CONFIG.INFO_RULE_POINTS);
    
    // Calculate score as percentage
    const score = totalPossiblePoints > 0 ? (actualPoints / totalPossiblePoints) * 100 : 0;
    
    // Determine grade
    const grade = GRADE_BOUNDARIES.find(boundary => score >= boundary.threshold)?.grade || 'F';
    
    return {
        score: Math.round(score * 100) / 100, // Round to 2 decimal places
        grade,
        breakdown: {
            criticalPassed,
            warningsPassed,
            totalPossiblePoints,
            actualPoints
        }
    };
}

/**
 * Convenience function to get both validation and scoring in one call
 */
export function assessQuality(entity: FoodTruck): { validation: ValidationResult; score: QualityScoreResult } {
    const validation = validateEntity(entity);
    const score = calculateQualityScore(entity, validation);
    
    return { validation, score };
}

