// lib/utils/typeGuards.ts

// Helper types from lib/types.ts are imported at the top for clarity.
import { FoodTruck, PriceRange, MenuCategory, MenuItem, DailyOperatingHours, OperatingHours, LocationData, FoodTruckSchema } from '../types';

// --- CORE UTILITY FUNCTIONS (Task 1.1.1 & 1.1.2) ---

/**
 * Checks if a value is a non-null object.
 */
export function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Safely checks if an object has a specific property. This is a robust implementation.
 */
export function hasProperty<T extends object>(obj: T, prop: PropertyKey): prop is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Checks if a value is a string.
 */
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

/**
 * Checks if a value is a valid number (and not NaN).
 */
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !Number.isNaN(value);
}

/**
 * Checks if a value is an array.
 */
export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

/**
 * Checks if a value is an array of strings.
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Asserts that a value is of a specific type, throwing a TypeError if validation fails.
 */
export function assertType<T>(value: unknown, validator: (v: unknown) => v is T, errorMessage?: string): asserts value is T {
  if (!validator(value)) {
    throw new TypeError(errorMessage ?? `Value does not match expected type.`);
  }
}

/**
 * Safely assigns a value if it passes validation, otherwise returns a fallback.
 * Useful for providing default values for potentially invalid or missing data.
 */
export function safeAssign<T>(value: unknown, fallback: T, validator: (v: unknown) => v is T): T {
  return validator(value) ? value : fallback;
}

// --- APPLICATION-SPECIFIC TYPE GUARDS ---

function isPriceRange(value: unknown): value is PriceRange {
  // Added '$$$$' to the check to fully match the PriceRange type definition.
  return isString(value) && (value === '$' || value === '$$' || value === '$$$' || value === '$$$$');
}

function isLocationData(value: unknown): value is LocationData['coordinates'] {
  if (!isValidObject(value)) return false;
  return hasProperty(value, 'lat') && isNumber(value.lat) &&
         hasProperty(value, 'lng') && isNumber(value.lng);
}

function isDailyOperatingHours(value: unknown): value is DailyOperatingHours {
  if (value === undefined) return true;
  if (!isValidObject(value)) return false;

  if (hasProperty(value, 'closed') && value.closed === true) {
    return true;
  }

  return hasProperty(value, 'open') && isString(value.open) &&
         hasProperty(value, 'close') && isString(value.close);
}

function isOperatingHours(value: unknown): value is OperatingHours {
  if (!isValidObject(value)) return false;
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  return days.every(day => hasProperty(value, day) && isDailyOperatingHours(value[day]));
}

function isMenuItem(value: unknown): value is MenuItem {
  if (!isValidObject(value)) return false;
  return hasProperty(value, 'name') && isString(value.name) &&
         hasProperty(value, 'dietary_tags') && isArray(value.dietary_tags);
}

function isMenuCategory(value: unknown): value is MenuCategory {
  if (!isValidObject(value)) return false;
  return hasProperty(value, 'name') && isString(value.name) &&
         hasProperty(value, 'items') && isArray(value.items) &&
         value.items.every(item => isMenuItem(item));
}

/**
 * Type guard for the base FoodTruckSchema.
 */
export function isFoodTruckSchema(value: unknown): value is FoodTruckSchema {
  if (!isValidObject(value)) return false;

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
export function isFoodTruck(value: unknown): value is FoodTruck {
  if (!isValidObject(value) || !isFoodTruckSchema(value)) return false;

  return hasProperty(value, 'id') && isString(value.id) &&
         hasProperty(value, 'created_at') && isString(value.created_at) &&
         hasProperty(value, 'updated_at') && isString(value.updated_at);
}