import { APIUsageService } from '../supabase';
import { APIMonitor } from '../monitoring/apiMonitor';

export interface UsageLimits {
  dailyRequestLimit: number;
  dailyTokenLimit: number;
}

export interface UsageCheck {
  canMakeRequest: boolean;
  usage?: {
    requests: { used: number; limit: number; remaining: number };
    tokens: { used: number; limit: number; remaining: number };
  };
}

export class GeminiUsageLimits {
  private static readonly DEFAULT_LIMITS: UsageLimits = {
    dailyRequestLimit: 1500,
    dailyTokenLimit: 32_000,
  };

  static async checkUsageLimits(limits: UsageLimits = this.DEFAULT_LIMITS): Promise<UsageCheck> {
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
    } catch (error: unknown) {
      console.warn('Error checking Gemini usage limits:', error);
      return { canMakeRequest: false };
    }
  }

  static async checkWithMonitoring(
    estimatedTokens: number
    // limits: UsageLimits = this.DEFAULT_LIMITS // Removed unused parameter
  ): Promise<{ allowed: boolean; reason?: string; waitTime?: number }> {
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
