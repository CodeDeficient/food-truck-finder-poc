/**
 * SOTA Rate Limiting Implementation
 * Prevents brute force attacks and API abuse with intelligent rate limiting
 */

import { NextResponse } from 'next/server'; // Added import for NextResponse

interface RateLimitEntry {
  count: number;
  resetTime: number;
  blocked: boolean;
  blockUntil?: number;
}

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Rate limit configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints - strict limits
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
    skipSuccessfulRequests: true,
  },
  // API endpoints - moderate limits
  api: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60, // 60 requests per minute
    blockDurationMs: 5 * 60 * 1000, // Block for 5 minutes
    skipSuccessfulRequests: false,
  },
  // Admin endpoints - very strict limits
  admin: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 requests per minute
    blockDurationMs: 15 * 60 * 1000, // Block for 15 minutes
    skipSuccessfulRequests: false,
  },
} as const;

export type RateLimitType = keyof typeof RATE_LIMIT_CONFIGS;

/**
 * Rate Limiter Service
 */
export class RateLimiter {
  // Extract logic from checkRateLimit to reduce function size
  private static isBlocked(entry: RateLimitEntry | undefined, now: number): boolean {
    return Boolean(
      entry && entry.blocked && entry.blockUntil != undefined && now < entry.blockUntil,
    );
  }

  private static resetEntry(
    entry: RateLimitEntry,
    now: number,
    config: (typeof RATE_LIMIT_CONFIGS)[RateLimitType],
  ): void {
    entry.count = 0;
    entry.resetTime = now + config.windowMs;
    entry.blocked = false;
    entry.blockUntil = undefined;
  }

  /**
   * Check if request should be rate limited
   */
  static checkRateLimit(
    identifier: string,
    type: RateLimitType = 'api',
  ): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    retryAfter?: number;
  } {
    const config = RATE_LIMIT_CONFIGS[type];
    const now = Date.now();
    const key = `${type}:${identifier}`;
    this.cleanupExpiredEntries();
    let entry = rateLimitStore.get(key);
    if (!entry) {
      entry = { count: 0, resetTime: now + config.windowMs, blocked: false };
      rateLimitStore.set(key, entry);
    }
    if (this.isBlocked(entry, now)) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.blockUntil! - now) / 1000),
      };
    }
    if (now >= entry.resetTime) {
      this.resetEntry(entry, now, config);
    }
    if (entry.count >= config.maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + config.blockDurationMs;
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil(config.blockDurationMs / 1000),
      };
    }
    entry.count += 1;
    rateLimitStore.set(key, entry);
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Record successful request (for auth endpoints)
   */
  static recordSuccess(identifier: string, type: RateLimitType = 'api'): void {
    const config = RATE_LIMIT_CONFIGS[type];
    if (!config.skipSuccessfulRequests) return;

    const key = `${type}:${identifier}`;
    const entry = rateLimitStore.get(key);

    if (entry) {
      // Reset counter on successful auth
      entry.count = 0;
      entry.blocked = false;
      entry.blockUntil = undefined;
      rateLimitStore.set(key, entry);
    }
  }

  /**
   * Get rate limit status without incrementing
   */
  static getStatus(
    identifier: string,
    type: RateLimitType = 'api',
  ): {
    remaining: number;
    resetTime: number;
    blocked: boolean;
    retryAfter?: number;
  } {
    const config = RATE_LIMIT_CONFIGS[type];
    const now = Date.now();
    const key = `${type}:${identifier}`;
    const entry = rateLimitStore.get(key);

    if (!entry) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    // Check if blocked
    if (entry.blocked && entry.blockUntil != undefined && now < entry.blockUntil) {
      // Changed != undefined to != null
      return {
        remaining: 0,
        resetTime: entry.resetTime,
        blocked: true,
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
      };
    }

    // Check if window expired
    if (now >= entry.resetTime) {
      return {
        remaining: config.maxRequests,
        resetTime: now + config.windowMs,
        blocked: false,
      };
    }

    return {
      remaining: Math.max(0, config.maxRequests - entry.count),
      resetTime: entry.resetTime,
      blocked: false,
    };
  }

  /**
   * Clean up expired entries to prevent memory leaks
   */
  private static cleanupExpiredEntries(): void {
    const now = Date.now();
    const entriesArray = Array.from(rateLimitStore.entries());

    for (const [key, entry] of entriesArray) {
      // Remove entries that are expired and not blocked
      if (
        now >= entry.resetTime &&
        (!entry.blocked || entry.blockUntil == undefined || now >= entry.blockUntil)
      ) {
        // Changed == undefined to == null
        rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Clear all rate limit data for an identifier
   */
  static clearLimits(identifier: string, type?: RateLimitType): void {
    if (type) {
      const key = `${type}:${identifier}`;
      rateLimitStore.delete(key);
    } else {
      // Clear all types for this identifier
      for (const limitType of Object.keys(RATE_LIMIT_CONFIGS) as RateLimitType[]) {
        // Added type assertion
        const key = `${limitType}:${identifier}`;
        rateLimitStore.delete(key);
      }
    }
  }

  /**
   * Get rate limit statistics
   */
  static getStats(): {
    totalEntries: number;
    blockedEntries: number;
    entriesByType: Record<string, number>;
  } {
    const stats = {
      totalEntries: rateLimitStore.size,
      blockedEntries: 0,
      entriesByType: {} as Record<string, number>,
    };

    for (const [key, entry] of rateLimitStore.entries()) {
      const type = key.split(':')[0];
      stats.entriesByType[type] = (stats.entriesByType[type] ?? 0) + 1;

      if (entry.blocked) {
        stats.blockedEntries += 1;
      }
    }

    return stats;
  }
}

/**
 * Utility function to get client identifier from request
 */
export function getClientIdentifier(request: Request): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const cfConnectingIp = request.headers.get('cf-connecting-ip');

  // Use the first available IP
  const ip = forwarded?.split(',')[0]?.trim() ?? realIp ?? cfConnectingIp ?? 'unknown';

  // Include user agent for more specific identification
  const userAgent = request.headers.get('user-agent') ?? 'unknown';

  // Create a hash of IP + User Agent for better identification
  return `${ip}:${userAgent.slice(0, 50)}`;
}

/**
 * Rate limiting middleware for API routes
 */
export function withRateLimit(
  handler: (request: Request) => Promise<Response>,
  type: RateLimitType = 'api',
) {
  return async (request: Request): Promise<Response> => {
    const identifier = getClientIdentifier(request);
    const result = RateLimiter.checkRateLimit(identifier, type);

    if (result.allowed === false) {
      const headers = new Headers({
        'X-RateLimit-Limit': RATE_LIMIT_CONFIGS[type].maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
      });

      if (result.retryAfter) {
        headers.set('Retry-After', result.retryAfter.toString());
      }

      return new NextResponse('Too Many Requests', { status: 429, headers });
    }

    const response = await handler(request);

    // Update headers on successful requests if not skipped
    if (RATE_LIMIT_CONFIGS[type].skipSuccessfulRequests === false) {
      const status = RateLimiter.getStatus(identifier, type);
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_CONFIGS[type].maxRequests.toString());
      response.headers.set('X-RateLimit-Remaining', status.remaining.toString());
      response.headers.set('X-RateLimit-Reset', new Date(status.resetTime).toISOString());
    }

    return response;
  };
}
