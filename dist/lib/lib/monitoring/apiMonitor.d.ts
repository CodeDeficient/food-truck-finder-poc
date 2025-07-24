/**
 * SOTA API Usage Monitoring and Alerting System
 * Implements proactive monitoring, alerting, and throttling for all external APIs
 */
export declare const API_LIMITS: {
    readonly gemini: {
        readonly requests: {
            readonly daily: 1500;
            readonly hourly: 100;
        };
        readonly tokens: {
            readonly daily: 32000;
            readonly hourly: 2000;
        };
        readonly alertThresholds: {
            readonly warning: 0.8;
            readonly critical: 0.95;
        };
    };
    readonly firecrawl: {
        readonly requests: {
            readonly daily: 500;
            readonly hourly: 50;
        };
        readonly tokens: {
            readonly daily: 0;
            readonly hourly: 0;
        };
        readonly alertThresholds: {
            readonly warning: 0.8;
            readonly critical: 0.95;
        };
    };
    readonly tavily: {
        readonly requests: {
            readonly daily: 1000;
            readonly hourly: 100;
        };
        readonly tokens: {
            readonly daily: 0;
            readonly hourly: 0;
        };
        readonly alertThresholds: {
            readonly warning: 0.8;
            readonly critical: 0.95;
        };
    };
    readonly supabase: {
        readonly requests: {
            readonly daily: 50000;
            readonly hourly: 5000;
        };
        readonly tokens: {
            readonly daily: 0;
            readonly hourly: 0;
        };
        readonly alertThresholds: {
            readonly warning: 0.9;
            readonly critical: 0.98;
        };
    };
};
export type APIService = keyof typeof API_LIMITS;
export type AlertLevel = 'info' | 'warning' | 'critical';
export interface APIUsageAlert {
    service: APIService;
    level: AlertLevel;
    message: string;
    usage: {
        current: number;
        limit: number;
        percentage: number;
    };
    timestamp: string;
    recommendations: string[];
}
export interface APIUsageData {
    requests: {
        used: number;
        limit: number;
        percentage: number;
    };
    tokens?: {
        used: number;
        limit: number;
        percentage: number;
    };
}
export interface APIMonitoringResult {
    canMakeRequest: boolean;
    alerts: APIUsageAlert[];
    usage: Record<APIService, APIUsageData>;
    recommendations: string[];
}
/**
 * Comprehensive API Monitoring Service
 */
export declare class APIMonitor {
    private static alertHistory;
    /**
     * Check if API request can be made safely
     */
    static canMakeRequest(service: APIService, requestCount?: number, tokenCount?: number): Promise<{
        allowed: boolean;
        reason?: string;
        waitTime?: number;
    }>;
    /**
     * Get current usage for a service
     */
    static getCurrentUsage(service: APIService): Promise<APIUsageData>;
    /**
     * Comprehensive monitoring check for all APIs
     */
    static checkAllAPIs(): Promise<APIMonitoringResult>;
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
    private static generateTokenAlerts;
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
    private static generateAlerts;
    /**
     * Generate optimization recommendations
     */
    private static generateRecommendations;
    /**
     * Get time until rate limit reset
     */
    private static getTimeUntilReset;
    /**
     * Get alert history
     */
    static getAlertHistory(): APIUsageAlert[];
    /**
     * Clear alert history
     */
    static clearAlertHistory(): void;
}
