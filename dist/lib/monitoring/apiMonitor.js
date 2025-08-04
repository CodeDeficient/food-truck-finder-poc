/**
 * SOTA API Usage Monitoring and Alerting System
 * Implements proactive monitoring, alerting, and throttling for all external APIs
 */
import { APIUsageService } from '../supabase.js';
// API Rate Limits Configuration
export const API_LIMITS = {
    gemini: {
        requests: { daily: 1500, hourly: 100 },
        tokens: { daily: 32_000, hourly: 2000 },
        alertThresholds: { warning: 0.8, critical: 0.95 },
    },
    firecrawl: {
        requests: { daily: 500, hourly: 50 },
        tokens: { daily: 0, hourly: 0 },
        alertThresholds: { warning: 0.8, critical: 0.95 },
    },
    tavily: {
        requests: { daily: 1000, hourly: 100 },
        tokens: { daily: 0, hourly: 0 },
        alertThresholds: { warning: 0.8, critical: 0.95 },
    },
    supabase: {
        requests: { daily: 50_000, hourly: 5000 },
        tokens: { daily: 0, hourly: 0 },
        alertThresholds: { warning: 0.9, critical: 0.98 },
    },
};
/**
 * Comprehensive API Monitoring Service
 */
export class APIMonitor {
    static alertHistory = [];
    /**
     * Check if API request can be made safely
     */
    static async canMakeRequest(service, requestCount = 1, tokenCount = 0) {
        try {
            const usage = await this.getCurrentUsage(service);
            const limits = API_LIMITS[service];
            // Check daily limits
            const newRequestCount = usage.requests.used + requestCount;
            const newTokenCount = (usage.tokens?.used ?? 0) + tokenCount;
            if (newRequestCount > limits.requests.daily) {
                return {
                    allowed: false,
                    reason: `Daily request limit exceeded (${newRequestCount}/${limits.requests.daily})`,
                    waitTime: this.getTimeUntilReset('daily'),
                };
            }
            if (limits.tokens != undefined && newTokenCount > limits.tokens.daily) {
                return {
                    allowed: false,
                    reason: `Daily token limit exceeded (${newTokenCount}/${limits.tokens.daily})`,
                    waitTime: this.getTimeUntilReset('daily'),
                };
            }
            // Check if approaching critical threshold
            const requestPercentage = newRequestCount / limits.requests.daily;
            if (requestPercentage > limits.alertThresholds.critical) {
                return {
                    allowed: false,
                    reason: `Approaching critical usage threshold (${(requestPercentage * 100).toFixed(1)}%)`,
                    waitTime: this.getTimeUntilReset('daily'),
                };
            }
            return { allowed: true };
        }
        catch (error) {
            console.error(`Error checking API limits for ${service}:`, error);
            // Fail safe - allow request but log error
            return { allowed: true };
        }
    }
    /**
     * Get current usage for a service
     */
    static async getCurrentUsage(service) {
        const todayUsage = await APIUsageService.getTodayUsage(service);
        const limits = API_LIMITS[service];
        const usage = {
            requests: {
                used: todayUsage?.requests_count ?? 0,
                limit: limits.requests.daily,
                percentage: ((todayUsage?.requests_count ?? 0) / limits.requests.daily) * 100,
            },
        };
        if (limits.tokens.daily > 0) {
            usage.tokens = {
                used: todayUsage?.tokens_used ?? 0,
                limit: limits.tokens.daily,
                percentage: ((todayUsage?.tokens_used ?? 0) / limits.tokens.daily) * 100,
            };
        }
        return usage;
    }
    /**
     * Comprehensive monitoring check for all APIs
     */
    static async checkAllAPIs() {
        const alerts = [];
        const usage = {};
        const recommendations = [];
        let canMakeRequest = true;
        for (const service of Object.keys(API_LIMITS)) {
            try {
                const serviceUsage = await this.getCurrentUsage(service);
                usage[service] = serviceUsage;
                // Check for alerts
                const serviceAlerts = this.generateAlerts(service, serviceUsage);
                alerts.push(...serviceAlerts);
                // Check if any service is at critical level
                if (serviceUsage.requests.percentage > API_LIMITS[service].alertThresholds.critical * 100) {
                    canMakeRequest = false;
                }
            }
            catch (error) {
                console.error(`Error monitoring ${service}:`, error);
                alerts.push({
                    service,
                    level: 'warning',
                    message: `Failed to check usage for ${service}`,
                    usage: { current: 0, limit: 0, percentage: 0 },
                    timestamp: new Date().toISOString(),
                    recommendations: ['Check API connectivity', 'Verify credentials'],
                });
            }
        }
        // Generate global recommendations
        recommendations.push(...this.generateRecommendations(usage, alerts));
        return {
            canMakeRequest,
            alerts,
            usage,
            recommendations,
        };
    }
    // Helper for token alerts
    /**
     * Generates token usage alerts based on API usage data and predefined limits.
     * @example
     * generateTokenAlerts(APIServiceInstance, usageData, apiLimits, '2023-10-21T10:20:30Z')
     * [{ service: 'exampleService', level: 'warning', message: 'Warning: exampleService token usage at 75.0%', ... }]
     * @param {APIService} service - The API service for which the alerts are being generated.
     * @param {APIUsageData} usage - Object containing the token usage statistics.
     * @param {Object} limits - Configuration object specifying API limits and alert thresholds.
     * @param {string} timestamp - The timestamp at which the alert is generated.
     * @returns {APIUsageAlert[]} List of alerts generated based on token usage percentage compared to limits.
     * @description
     *   - Generates 'warning' alerts if token usage exceeds the warning threshold.
     *   - Generates 'critical' alerts if token usage exceeds the critical threshold.
     *   - Provides recommendations for optimizing token usage when an alert is generated.
     */
    static generateTokenAlerts(service, usage, limits, timestamp) {
        const alerts = [];
        if (usage.tokens && limits.tokens.daily > 0) {
            const tokenPercentage = usage.tokens.percentage;
            if (tokenPercentage > limits.alertThresholds.critical * 100) {
                alerts.push({
                    service,
                    level: 'critical',
                    message: `Critical: ${service} token usage at ${tokenPercentage.toFixed(1)}%`,
                    usage: {
                        current: usage.tokens.used,
                        limit: usage.tokens.limit,
                        percentage: tokenPercentage,
                    },
                    timestamp,
                    recommendations: [
                        'Reduce prompt complexity',
                        'Implement response caching',
                        'Optimize token usage patterns',
                    ],
                });
            }
            else if (tokenPercentage > limits.alertThresholds.warning * 100) {
                alerts.push({
                    service,
                    level: 'warning',
                    message: `Warning: ${service} token usage at ${tokenPercentage.toFixed(1)}%`,
                    usage: {
                        current: usage.tokens.used,
                        limit: usage.tokens.limit,
                        percentage: tokenPercentage,
                    },
                    timestamp,
                    recommendations: [
                        'Monitor token consumption',
                        'Optimize prompt efficiency',
                        'Consider response caching',
                    ],
                });
            }
        }
        return alerts;
    }
    /**
     * Generates usage alerts based on the service's API usage data.
     * @example
     * generateAlerts(APIService.YOUR_SERVICE, apiUsageData)
     * returns an array of APIUsageAlert objects when usage thresholds are exceeded.
     * @param {APIService} service - The API service being monitored.
     * @param {APIUsageData} usage - The usage data containing request and token information.
     * @returns {APIUsageAlert[]} An array of alert objects representing warning or critical usage states.
     * @description
     *   - Determines alert level based on predefined thresholds in API_LIMITS.
     *   - Generates alerts for both request and token usage.
     *   - Updates alert history, maintaining only the last 100 alerts.
     */
    static generateAlerts(service, usage) {
        const alerts = [];
        const limits = API_LIMITS[service];
        const timestamp = new Date().toISOString();
        // Check request usage
        const requestPercentage = usage.requests.percentage;
        if (requestPercentage > limits.alertThresholds.critical * 100) {
            alerts.push({
                service,
                level: 'critical',
                message: `Critical: ${service} request usage at ${requestPercentage.toFixed(1)}%`,
                usage: {
                    current: usage.requests.used,
                    limit: usage.requests.limit,
                    percentage: requestPercentage,
                },
                timestamp,
                recommendations: [
                    'Immediately reduce API calls',
                    'Implement request queuing',
                    'Consider upgrading API plan',
                ],
            });
        }
        else if (requestPercentage > limits.alertThresholds.warning * 100) {
            alerts.push({
                service,
                level: 'warning',
                message: `Warning: ${service} request usage at ${requestPercentage.toFixed(1)}%`,
                usage: {
                    current: usage.requests.used,
                    limit: usage.requests.limit,
                    percentage: requestPercentage,
                },
                timestamp,
                recommendations: [
                    'Monitor usage closely',
                    'Optimize request patterns',
                    'Enable request caching',
                ],
            });
        }
        // Token alerts
        alerts.push(...this.generateTokenAlerts(service, usage, limits, timestamp));
        // Store alerts in history
        this.alertHistory.push(...alerts);
        // Keep only last 100 alerts
        if (this.alertHistory.length > 100) {
            this.alertHistory = this.alertHistory.slice(-100);
        }
        return alerts;
    }
    /**
     * Generate optimization recommendations
     */
    static generateRecommendations(usage, alerts) {
        const recommendations = [];
        // High-level optimization recommendations
        const criticalAlerts = alerts.filter((a) => a.level === 'critical');
        const warningAlerts = alerts.filter((a) => a.level === 'warning');
        if (criticalAlerts.length > 0) {
            recommendations.push('URGENT: Implement immediate API throttling', 'Enable aggressive caching for all API responses', 'Consider upgrading API plans for critical services');
        }
        if (warningAlerts.length > 0) {
            recommendations.push('Implement request queuing and batching', 'Optimize API call patterns and frequency', 'Enable response caching where possible');
        }
        // Service-specific recommendations
        if (usage.gemini?.requests?.percentage > 70) {
            recommendations.push('Gemini: Optimize prompt length and complexity', 'Gemini: Implement response caching for similar queries');
        }
        if (usage.firecrawl?.requests?.percentage > 70) {
            recommendations.push('Firecrawl: Implement URL deduplication', 'Firecrawl: Cache crawl results for repeated URLs');
        }
        return [...new Set(recommendations)]; // Remove duplicates
    }
    /**
     * Get time until rate limit reset
     */
    static getTimeUntilReset(period) {
        const now = new Date();
        if (period === 'hourly') {
            const nextHour = new Date(now);
            nextHour.setHours(now.getHours() + 1, 0, 0, 0);
            return nextHour.getTime() - now.getTime();
        }
        const nextDay = new Date(now);
        nextDay.setDate(now.getDate() + 1);
        nextDay.setHours(0, 0, 0, 0);
        return nextDay.getTime() - now.getTime();
    }
    /**
     * Get alert history
     */
    static getAlertHistory() {
        return [...this.alertHistory];
    }
    /**
     * Clear alert history
     */
    static clearAlertHistory() {
        this.alertHistory = [];
    }
}
