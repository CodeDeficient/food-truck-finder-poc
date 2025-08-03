/**
 * Safe object utility for safe destructuring of potentially null/undefined objects
 * 
 * This utility helps avoid repetitive null checks and provides a clean way to destructure
 * object properties safely by providing an empty object fallback.
 * 
 * @example
 * // Instead of: truck.social_media ?? {}
 * // Use: safe(truck.social_media)
 * const { instagram } = safe(truck.social_media);
 * 
 * @example
 * // Instead of: contact_info = {} 
 * // Use: safe(truck.contact_info)
 * const { phone, email, website } = safe(truck.contact_info);
 */
export const safe = <T extends object | undefined | null>(obj: T): NonNullable<T> extends object ? NonNullable<T> : never => (obj ?? {}) as never;
