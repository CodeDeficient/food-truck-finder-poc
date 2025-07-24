import type { FoodTruck, FoodTruckSchema } from '../types';
/**
 * Checks if a value is a non-null object.
 */
export declare function isValidObject(value: unknown): value is Record<string, unknown>;
/**
 * Safely checks if an object has a specific property. This is a robust implementation.
 */
export declare function hasProperty<T extends object>(obj: T, prop: PropertyKey): prop is keyof T;
/**
 * Checks if a value is a string.
 */
export declare function isString(value: unknown): value is string;
/**
 * Checks if a value is a valid number (and not NaN).
 */
export declare function isNumber(value: unknown): value is number;
/**
 * Checks if a value is an array.
 */
export declare function isArray(value: unknown): value is unknown[];
/**
 * Checks if a value is an array of strings.
 */
export declare function isStringArray(value: unknown): value is string[];
/**
 * Asserts that a value is of a specific type, throwing a TypeError if validation fails.
 */
export declare function assertType<T>(value: unknown, validator: (v: unknown) => v is T, errorMessage?: string): asserts value is T;
/**
 * Safely assigns a value if it passes validation, otherwise returns a fallback.
 * Useful for providing default values for potentially invalid or missing data.
 */
export declare function safeAssign<T>(value: unknown, fallback: T, validator: (v: unknown) => v is T): T;
/**
 * Type guard for the base FoodTruckSchema.
 */
export declare function isFoodTruckSchema(value: unknown): value is FoodTruckSchema;
/**
 * Type guard for the full FoodTruck object (schema + ID fields).
 */
export declare function isFoodTruck(value: unknown): value is FoodTruck;
