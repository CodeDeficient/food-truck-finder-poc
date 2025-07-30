import type { ApiUsage } from '../types/index.js';
export declare const APIUsageService: {
    trackUsage(serviceName: string, requests: number, tokens: number): Promise<ApiUsage>;
    getTodayUsage(serviceName: string): Promise<ApiUsage | undefined>;
    getAllUsageStats(): Promise<ApiUsage[]>;
};
