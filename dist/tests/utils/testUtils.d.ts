import { SupabaseClient } from '@supabase/supabase-js';
import type { FoodTruck } from '../../lib/types';
export interface TestAPIResponse {
    success: boolean;
    data?: unknown;
    error?: string;
    message?: string;
}
export interface TestRequestConfig {
    method: string;
    headers?: Record<string, string>;
    body?: string;
}
/**
 * Utility functions for testing the food truck finder application
 */
export declare const TestUtils: {
    /**
     * Make a test HTTP request to the API
     */
    makeTestRequest(url: string, config: TestRequestConfig): Promise<TestAPIResponse>;
    /**
     * Create test food truck data
     */
    createTestFoodTruck(overrides?: Partial<FoodTruck>): Omit<FoodTruck, "id" | "created_at" | "updated_at">;
    /**
     * Clean up test data from the database
     */
    cleanupTestData(): Promise<void>;
    /**
     * Insert test food truck into database
     */
    insertTestFoodTruck(truckData?: Partial<FoodTruck>): Promise<FoodTruck | undefined>;
    /**
     * Wait for a condition to be met with timeout
     */
    waitForCondition(condition: () => Promise<boolean>, timeoutMs?: number, intervalMs?: number): Promise<boolean>;
    /**
     * Generate test API payload
     */
    generateTestPayload(type: "scrape" | "pipeline" | "discovery"): Record<string, unknown>;
};
/**
 * Database utilities for testing
 */
export declare const DatabaseTestUtils: {
    /**
     * Get database client for testing
     */
    getClient(): SupabaseClient;
    /**
     * Check if database is accessible
     */
    checkConnection(): Promise<boolean>;
    /**
     * Get test data counts
     */
    getTestDataCounts(): Promise<{
        foodTrucks: number;
        discoveredUrls: number;
        scrapingJobs: number;
    }>;
};
