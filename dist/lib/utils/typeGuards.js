// lib/utils/typeGuards.ts
// --- CORE UTILITY FUNCTIONS (Task 1.1.1 & 1.1.2) ---
/**
 * Checks if a value is a non-null object.
 */
export function isValidObject(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
/**
 * Safely checks if an object has a specific property. This is a robust implementation.
 */
export function hasProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
}
/**
 * Checks if a value is a string.
 */
export function isString(value) {
    return typeof value === 'string';
}
/**
 * Checks if a value is a valid number (and not NaN).
 */
export function isNumber(value) {
    return typeof value === 'number' && !Number.isNaN(value);
}
/**
 * Checks if a value is an array.
 */
export function isArray(value) {
    return Array.isArray(value);
}
/**
 * Checks if a value is an array of strings.
 */
export function isStringArray(value) {
    return Array.isArray(value) && value.every(item => typeof item === 'string');
}
/**
 * Asserts that a value is of a specific type, throwing a TypeError if validation fails.
 */
export function assertType(value, validator, errorMessage) {
    if (!validator(value)) {
        throw new TypeError(errorMessage !== null && errorMessage !== void 0 ? errorMessage : `Value does not match expected type.`);
    }
}
/**
 * Safely assigns a value if it passes validation, otherwise returns a fallback.
 * Useful for providing default values for potentially invalid or missing data.
 */
export function safeAssign(value, fallback, validator) {
    return validator(value) ? value : fallback;
}
// --- APPLICATION-SPECIFIC TYPE GUARDS ---
function isPriceRange(value) {
    // Added '$$$$' to the check to fully match the PriceRange type definition.
    return isString(value) && (value === '$' || value === '$$' || value === '$$$' || value === '$$$$');
}
function isLocationData(value) {
    if (!isValidObject(value))
        return false;
    return hasProperty(value, 'lat') && isNumber(value.lat) &&
        hasProperty(value, 'lng') && isNumber(value.lng);
}
function isDailyOperatingHours(value) {
    if (value === undefined)
        return true;
    if (!isValidObject(value))
        return false;
    if (hasProperty(value, 'closed') && value.closed === true) {
        return true;
    }
    return hasProperty(value, 'open') && isString(value.open) &&
        hasProperty(value, 'close') && isString(value.close);
}
function isOperatingHours(value) {
    if (!isValidObject(value))
        return false;
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days.every(day => hasProperty(value, day) && isDailyOperatingHours(value[day]));
}
function isMenuItem(value) {
    if (!isValidObject(value))
        return false;
    return hasProperty(value, 'name') && isString(value.name) &&
        hasProperty(value, 'dietary_tags') && isArray(value.dietary_tags);
}
function isMenuCategory(value) {
    if (!isValidObject(value))
        return false;
    return hasProperty(value, 'name') && isString(value.name) &&
        hasProperty(value, 'items') && isArray(value.items) &&
        value.items.every(item => isMenuItem(item));
}
/**
 * Type guard for the base FoodTruckSchema.
 */
export function isFoodTruckSchema(value) {
    if (!isValidObject(value))
        return false;
    // This property is optional, so it's valid if it's missing, undefined, or matches the type.
    const isPriceRangeValid = !hasProperty(value, 'price_range') || value.price_range === undefined || isPriceRange(value.price_range);
    return hasProperty(value, 'name') && isString(value.name) &&
        hasProperty(value, 'description') && isString(value.description) &&
        hasProperty(value, 'current_location') && isValidObject(value.current_location) && isLocationData(value.current_location) &&
        hasProperty(value, 'operating_hours') && isOperatingHours(value.operating_hours) &&
        hasProperty(value, 'menu') && isArray(value.menu) && value.menu.every(item => isMenuCategory(item)) &&
        hasProperty(value, 'cuisine_type') && isStringArray(value.cuisine_type) &&
        isPriceRangeValid && // Using the isPriceRange function here
        hasProperty(value, 'data_quality_score') && isNumber(value.data_quality_score) &&
        hasProperty(value, 'verification_status') && isString(value.verification_status) &&
        hasProperty(value, 'source_urls') && isStringArray(value.source_urls) &&
        hasProperty(value, 'last_scraped_at') && isString(value.last_scraped_at);
}
/**
 * Type guard for the full FoodTruck object (schema + ID fields).
 */
export function isFoodTruck(value) {
    if (!isValidObject(value) || !isFoodTruckSchema(value))
        return false;
    return hasProperty(value, 'id') && isString(value.id) &&
        hasProperty(value, 'created_at') && isString(value.created_at) &&
        hasProperty(value, 'updated_at') && isString(value.updated_at);
}
