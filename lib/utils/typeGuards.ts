/**
 * Type guard to check if a value is a non-null object and can be treated as a Record<string, unknown>.
 * @param value The value to check.
 * @returns True if the value is an object, false otherwise.
 */
export function isValidObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/**
 * Type guard to check if an object has a specific property.
 * @param obj The object to check.
 * @param prop The name of the property to check for.
 * @returns True if the object has the property, false otherwise.
 */
export function hasProperty<T extends object>(obj: T, prop: PropertyKey): prop is keyof T {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

/**
 * Type guard to check if a value is an array of strings.
 * @param value The value to check.
 * @returns True if the value is a string array, false otherwise.
 */
export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every(item => typeof item === 'string');
}

/**
 * Asserts that a value is of a specific type using a provided validator function.
 * Throws a TypeError if the validation fails.
 * @param value The value to assert.
 * @param validator A type guard function that validates the value.
 * @param errorMessage An optional error message to throw if validation fails.
 * @template T The expected type of the value.
 */
export function assertType<T>(value: unknown, validator: (v: unknown) => v is T, errorMessage?: string): asserts value is T {
  if (!validator(value)) {
    throw new TypeError(errorMessage ?? `Value "${JSON.stringify(value)}" does not match expected type.`);
  }
}

/**
 * Safely assigns a value if it passes validation, otherwise returns a fallback value.
 * Useful for providing default values when dealing with potentially invalid or missing data.
 * @param value The value to attempt to assign.
 * @param fallback The fallback value to return if validation fails.
 * @param validator A type guard function that validates the value.
 * @returns The validated value or the fallback value.
 * @template T The expected type of the value.
 */
export function safeAssign<T>(value: unknown, fallback: T, validator: (v: unknown) => v is T): T {
  if (validator(value)) {
    return value;
  }
  console.warn(`Validation failed for value: "${JSON.stringify(value)}". Using fallback: "${JSON.stringify(fallback)}".`);
  return fallback;
}