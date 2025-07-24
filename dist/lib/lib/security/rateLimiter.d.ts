/**
 * SOTA Rate Limiting Implementation
 * Prevents brute force attacks and API abuse with intelligent rate limiting
 */
export declare const RATE_LIMIT_CONFIGS: {
    readonly auth: {
        readonly windowMs: number;
        readonly maxRequests: 5;
        readonly blockDurationMs: number;
        readonly skipSuccessfulRequests: true;
    };
    readonly api: {
        readonly windowMs: number;
        readonly maxRequests: 60;
        readonly blockDurationMs: number;
        readonly skipSuccessfulRequests: false;
    };
    readonly admin: {
        readonly windowMs: number;
        readonly maxRequests: 20;
        readonly blockDurationMs: number;
        readonly skipSuccessfulRequests: false;
    };
};
export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;
/**
 * Rate Limiter Service
 */
export declare class RateLimiter {
    private static isBlocked;
    private static resetEntry;
    /**
     * Check if request should be rate limited
     */
    static checkRateLimit(identifier: string, type?: RateLimitType): {
        allowed: boolean;
        remaining: number;
        resetTime: number;
        retryAfter?: number;
    };
    /**
     * Record successful request (for auth endpoints)
     */
    static recordSuccess(identifier: string, type?: RateLimitType): void;
    /**
     * Get rate limit status without incrementing
     */
    static getStatus(identifier: string, type?: RateLimitType): {
        remaining: number;
        resetTime: number;
        blocked: boolean;
        retryAfter?: number;
    };
    /**
     * Clean up expired entries to prevent memory leaks
     */
    private static cleanupExpiredEntries;
    /**
     * Clear all rate limit data for an identifier
     */
    static clearLimits(identifier: string, type?: RateLimitType): void;
    /**
     * Get rate limit statistics
     */
    static getStats(): {
        totalEntries: number;
        blockedEntries: number;
        entriesByType: Record<string, number>;
    };
}
/**
 * Utility function to get client identifier from request
 */
export declare function getClientIdentifier(request: Request): string;
/**
 * Rate limiting middleware for API routes
 */
export declare function withRateLimit(handler: (request: Request) => Promise<Response>, type?: RateLimitType): (request: Request) => Promise<Response>;
