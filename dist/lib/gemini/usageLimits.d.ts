export interface UsageLimits {
    dailyRequestLimit: number;
    dailyTokenLimit: number;
}
export interface UsageCheck {
    canMakeRequest: boolean;
    usage?: {
        requests: {
            used: number;
            limit: number;
            remaining: number;
        };
        tokens: {
            used: number;
            limit: number;
            remaining: number;
        };
    };
}
export declare class GeminiUsageLimits {
    private static readonly DEFAULT_LIMITS;
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
    static checkUsageLimits(limits?: UsageLimits): Promise<UsageCheck>;
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
    static checkWithMonitoring(estimatedTokens: number, _limits?: UsageLimits): Promise<{
        allowed: boolean;
        reason?: string;
        waitTime?: number;
    }>;
}
