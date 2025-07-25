/**
 * SOTA Duplicate Prevention System
 * Implements intelligent duplicate detection and prevention for food truck data
 */
import { FoodTruckService } from '@/lib/supabase';
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
};
/**
 * Advanced Duplicate Prevention Service
 */
export class DuplicatePreventionService {
    /**
     * Check if a food truck is a duplicate of existing trucks
     */
    static async checkForDuplicates(candidateTruck) {
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
            const matches = [];
            for (const existingTruck of existingTrucks) {
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
        }
        catch (error) {
            console.error('Error checking for duplicates:', error);
            return {
                isDuplicate: false,
                matches: [],
                action: 'create',
                reason: 'An unexpected error occurred during duplicate detection - proceeding with creation',
            };
        }
    }
    /**
     * Processes the matches found during duplicate detection and returns the result.
     */
    static processDuplicateMatches(matches, candidateTruck) {
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
    static calculateSimilarity(candidate, existing) {
        var _a, _b;
        const breakdown = {};
        const matchedFields = [];
        // Name similarity
        const nameSimilarity = this.calculateStringSimilarity((_a = candidate.name) !== null && _a !== void 0 ? _a : '', (_b = existing.name) !== null && _b !== void 0 ? _b : '');
        breakdown.name = nameSimilarity;
        if (nameSimilarity >= DUPLICATE_DETECTION_CONFIG.thresholds.name) {
            matchedFields.push('name');
        }
        // Location similarity
        const locationSimilarity = this.calculateLocationSimilarity(candidate.current_location, existing.current_location);
        breakdown.location = locationSimilarity;
        if (locationSimilarity >= DUPLICATE_DETECTION_CONFIG.thresholds.location) {
            matchedFields.push('location');
        }
        // Contact similarity
        const contactSimilarity = this.calculateContactSimilarity(candidate.contact_info, existing.contact_info);
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
        const overall = nameSimilarity * DUPLICATE_DETECTION_CONFIG.weights.name +
            locationSimilarity * DUPLICATE_DETECTION_CONFIG.weights.location +
            contactSimilarity * DUPLICATE_DETECTION_CONFIG.weights.contact +
            menuSimilarity * DUPLICATE_DETECTION_CONFIG.weights.menu;
        return { overall, matchedFields, breakdown };
    }
    /**
     * Calculate string similarity using Levenshtein distance
     */
    static calculateStringSimilarity(str1, str2) {
        if (!str1 || !str2)
            return 0;
        // Normalize strings
        const s1 = str1.toLowerCase().trim();
        const s2 = str2.toLowerCase().trim();
        if (s1 === s2)
            return 1;
        // Calculate Levenshtein distance
        const matrix = [];
        const len1 = s1.length;
        const len2 = s2.length;
        for (let i = 0; i <= len1; i += 1) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len2; j += 1) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= len1; i += 1) {
            // eslint-disable-next-line sonarjs/no-redundant-assignments
            for (let j = 1; j <= len2; j += 1) {
                const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(matrix[i - 1][j] + 1, // deletion
                matrix[i][j - 1] + 1, // insertion
                matrix[i - 1][j - 1] + cost);
            }
        }
        const distance = matrix[len1][len2];
        const maxLength = Math.max(len1, len2);
        return maxLength === 0 ? 1 : 1 - distance / maxLength;
    }
    /**
     * Calculate location similarity
     */
    static calculateLocationSimilarity(loc1, loc2) {
        if (!loc1 || !loc2)
            return 0;
        let similarity = 0;
        let factors = 0;
        // Address similarity
        if (loc1.address && loc2.address) {
            similarity += this.calculateStringSimilarity(loc1.address, loc2.address);
            factors += 1;
        }
        // GPS coordinate similarity (within 100 meters = high similarity)
        if (loc1.lat && loc1.lng && loc2.lat && loc2.lng) {
            const distance = this.calculateGPSDistance(loc1.lat, loc1.lng, loc2.lat, loc2.lng);
            // Distance similarity (closer = higher similarity)
            const distanceSimilarity = distance <= 0.1 ? 1 : Math.max(0, 1 - distance / 1); // 1km max
            similarity += distanceSimilarity;
            factors += 1;
        }
        return factors > 0 ? similarity / factors : 0;
    }
    /**
     * Calculate GPS distance in kilometers
     */
    static calculateGPSDistance(lat1, lng1, lat2, lng2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLng = ((lng2 - lng1) * Math.PI) / 180;
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
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
    static calculateContactSimilarity(contact1, contact2) {
        if (!contact1 || !contact2)
            return 0;
        let matches = 0;
        let total = 0;
        // Phone number exact match
        if (contact1.phone != undefined && contact2.phone != undefined) {
            const phone1 = contact1.phone.replaceAll(/\D/g, ''); // Remove non-digits
            const phone2 = contact2.phone.replaceAll(/\D/g, '');
            if (phone1 === phone2)
                matches += 1;
            total += 1;
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
            if (url1 === url2)
                matches += 1;
            total += 1;
        }
        // Email similarity
        if (contact1.email != undefined && contact2.email != undefined) {
            if (contact1.email.toLowerCase() === contact2.email.toLowerCase())
                matches += 1;
            total += 1;
        }
        return total > 0 ? matches / total : 0;
    }
    /**
     * Calculate menu similarity (basic implementation)
     */
    static calculateMenuSimilarity(menu1, menu2) {
        if (!menu1 || !menu2 || menu1.length === 0 || menu2.length === 0)
            return 0;
        // Simple category name matching
        const categories1 = menu1
            .map((cat) => { var _a, _b; return (_b = (_a = cat.category) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : ''; })
            .filter(Boolean);
        const categories2 = menu2
            .map((cat) => { var _a, _b; return (_b = (_a = cat.category) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : ''; })
            .filter(Boolean);
        const commonCategories = categories1.filter((cat) => categories2.includes(cat));
        const totalCategories = new Set([...categories1, ...categories2]).size;
        return totalCategories > 0 ? commonCategories.length / totalCategories : 0;
    }
    /**
     * Get confidence level based on similarity score
     */
    static getConfidenceLevel(similarity) {
        if (similarity >= 0.95)
            return 'high';
        if (similarity >= 0.85)
            return 'medium';
        return 'low';
    }
    /**
     * Get recommendation based on similarity analysis
     */
    static getRecommendation(similarity) {
        if (similarity.overall >= 0.95)
            return 'merge';
        if (similarity.overall >= 0.9)
            return 'update';
        if (similarity.overall >= 0.8)
            return 'manual_review';
        return 'skip';
    }
    /**
     * Determine action based on matches
     */
    static determineAction(matches, _candidate) {
        if (matches.length === 0)
            return 'create';
        const bestMatch = matches[0];
        if (bestMatch.confidence === 'high') {
            const { recommendation } = bestMatch;
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
    static generateReason(matches, _candidate) {
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
    static async mergeDuplicates(targetId, sourceId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
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
        const mergedData = {
            name: (_a = target.name) !== null && _a !== void 0 ? _a : source.name,
            description: (_b = target.description) !== null && _b !== void 0 ? _b : source.description,
            cuisine_type: ((_d = (_c = target.cuisine_type) === null || _c === void 0 ? void 0 : _c.length) !== null && _d !== void 0 ? _d : 0) > 0 ? target.cuisine_type : source.cuisine_type,
            price_range: (_e = target.price_range) !== null && _e !== void 0 ? _e : source.price_range,
            current_location: (_f = target.current_location) !== null && _f !== void 0 ? _f : source.current_location,
            contact_info: Object.assign(Object.assign({}, source.contact_info), target.contact_info),
            operating_hours: (_g = target.operating_hours) !== null && _g !== void 0 ? _g : source.operating_hours,
            menu: ((_j = (_h = target.menu) === null || _h === void 0 ? void 0 : _h.length) !== null && _j !== void 0 ? _j : 0) > 0 ? target.menu : source.menu,
            social_media: Object.assign(Object.assign({}, source.social_media), target.social_media),
            source_urls: [...new Set([...((_k = target.source_urls) !== null && _k !== void 0 ? _k : []), ...((_l = source.source_urls) !== null && _l !== void 0 ? _l : [])])],
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
}
