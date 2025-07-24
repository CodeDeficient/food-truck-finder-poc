import { APIUsageService } from '../supabase/services/apiUsageService.js';
import { APIMonitor } from '../monitoring/apiMonitor.js';
export class GeminiUsageLimits {
    static DEFAULT_LIMITS = {
        dailyRequestLimit: 1500,
        dailyTokenLimit: 32_000,
    };
    /**
     * Checks the current usage against predefined limits and determines if further requests can be made.
     * @example
     * checkUsageLimits()
     * { canMakeRequest: true, usage: { requests: { used: 50, limit: 1000, remaining: 950 }, tokens: { used: 200, limit: 5000, remaining: 4800 } } }
     * @param {UsageLimits} limits - Object containing usage limits for requests and tokens.
     * @returns {Promise<UsageCheck>} Object indicating if a request can be made and the current usage statistics.
     * @description
     *   - Attempts to fetch today's usage data from the APIUsageService for 'gemini'.
     *   - If the fetch fails, defaults to allowing the request with a warning.
     *   - Maintains a buffer of 100 tokens to ensure requests are not made when limits are too close.
     */
    static async checkUsageLimits(limits = this.DEFAULT_LIMITS) {
        try {
            const usage = await APIUsageService.getTodayUsage('gemini');
            if (!usage) {
                return { canMakeRequest: true };
            }
            const requestsUsed = usage.requests_count ?? 0;
            const tokensUsed = usage.tokens_used ?? 0;
            const requestsRemaining = limits.dailyRequestLimit - requestsUsed;
            const tokensRemaining = limits.dailyTokenLimit - tokensUsed;
            return {
                canMakeRequest: requestsRemaining > 0 && tokensRemaining > 100, // Keep 100 token buffer
                usage: {
                    requests: {
                        used: requestsUsed,
                        limit: limits.dailyRequestLimit,
                        remaining: requestsRemaining,
                    },
                    tokens: {
                        used: tokensUsed,
                        limit: limits.dailyTokenLimit,
                        remaining: tokensRemaining,
                    },
                },
            };
        }
        catch (error) {
            console.warn('Error checking Gemini usage limits:', error);
            return { canMakeRequest: false };
        }
    }
    /**
    * Checks if a request can be made with monitoring and returns whether the operation is allowed.
    * @example
    * checkWithMonitoring(100, DEFAULT_LIMITS)
    * { allowed: true }
    * @param {number} estimatedTokens - Number of estimated tokens for the request.
    * @param {UsageLimits} _limits - Usage limits configuration for requests (default provided internally).
    * @returns {Promise<{ allowed: boolean; reason?: string; waitTime?: number }>} Object indicating if the request is allowed and why not if denied.
    * @description
    *   - Uses an internal API monitor to check if requests can be made based on predefined limits.
    *   - Wait time is converted from milliseconds to minutes before being returned.
    */
    static async checkWithMonitoring(estimatedTokens, _limits = this.DEFAULT_LIMITS) {
        const canMakeRequest = await APIMonitor.canMakeRequest('gemini', 1, estimatedTokens);
        if (!canMakeRequest.allowed) {
            return {
                allowed: false,
                reason: `API limit reached: ${canMakeRequest.reason}. Wait time: ${Math.ceil((canMakeRequest.waitTime ?? 0) / 1000 / 60)} minutes`,
            };
        }
        return { allowed: true };
    }
}
