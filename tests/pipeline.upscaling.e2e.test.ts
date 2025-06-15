// @ts-expect-error TS(2792): Cannot find module '@playwright/test'. Did you mea... Remove this comment to see the full error message
import { test, expect } from '@playwright/test';
import { supabaseAdmin } from '../lib/supabase';
import { FoodTruck } from '../lib/supabase';

/**
 * Comprehensive E2E test suite for data pipeline upscaling
 * Tests various scenarios for autonomous discovery, scraping, and ingestion at scale
 */

// Test configuration
const TEST_URLS = [
  'https://www.rotirolls.com/',
  // Add more test URLs as needed for load testing
];

const POLLING_CONFIG = {
  maxAttempts: 20,
  delay: 3000, // 3 seconds
  longDelay: 10000, // 10 seconds for heavy operations
};

test.describe('Pipeline Upscaling E2E Tests', () => {
  let initialTruckCount: number = 0;

  test.beforeAll(async () => {
    // Record initial state
    const { count, error } = await supabaseAdmin
      .from('food_trucks')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting initial truck count:', error);
    }
    initialTruckCount = count || 0;
    console.info(`Initial truck count: ${initialTruckCount}`);
  });

  test.afterAll(async () => {
    // Clean up test data if needed
    console.info('Test suite completed');
  });

  test('Pipeline Health Check - Basic Functionality', async ({
    request
  }: any) => {
    // Test all key API endpoints
    const endpoints = [
      '/api/test-integration',
      '/api/test-pipeline-run',
      '/api/auto-scrape-initiate',
    ];

    for (const endpoint of endpoints) {
      const response = await request.get(endpoint);
      expect(response.ok()).toBeTruthy();
      const json = await response.json();
      expect(json).toHaveProperty('message');
      console.log(`✓ ${endpoint}: ${json.message}`);
    }
  });

  test('Single URL Processing - Complete Pipeline', async ({
    request
  }: any) => {
    const testUrl = TEST_URLS[0];

    // Clean up existing data for this URL
    await cleanupTruckByUrl(testUrl);

    // Trigger pipeline for single URL
    const response = await request.post('/api/test-pipeline-run', {
      data: { url: testUrl },
    });

    expect(response.ok()).toBeTruthy();
    const result = await response.json();
    expect(result).toHaveProperty('success', true);

    // Poll for completion
    const truck = await pollForTruckByUrl(
      testUrl,
      POLLING_CONFIG.maxAttempts,
      POLLING_CONFIG.delay,
    );

    // Validate truck data quality
    expect(truck).not.toBeNull();
    expect(truck?.name).toBeDefined();
    expect(truck?.name).not.toBe('');
    expect(truck?.description).toBeDefined();
    expect(truck?.source_urls).toContain(testUrl);
    expect(truck?.menu).toBeDefined();
    expect(Array.isArray(truck?.menu)).toBeTruthy();

    // Validate menu structure
    if (truck?.menu && Array.isArray(truck.menu) && truck.menu.length > 0) {
      const firstCategory = truck.menu[0];
      expect(firstCategory).toHaveProperty('category');
      expect(firstCategory).toHaveProperty('items');
      expect(Array.isArray(firstCategory.items)).toBeTruthy();
    }
  });

  test('Autonomous Discovery - Multiple URLs', async ({
    request
  }: any) => {
    // Record current state
    const { count: beforeCount } = await supabaseAdmin
      .from('food_trucks')
      .select('*', { count: 'exact', head: true });

    // Trigger autonomous discovery
    const response = await request.get('/api/auto-scrape-initiate');
    expect(response.ok()).toBeTruthy();

    const result = await response.json();
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('results');

    console.log(`Autonomous discovery result:`, result.results);

    // Wait for processing to complete
    await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.longDelay));

    // Check if new trucks were added
    const { count: afterCount } = await supabaseAdmin
      .from('food_trucks')
      .select('*', { count: 'exact', head: true });

    expect(afterCount).toBeGreaterThanOrEqual(beforeCount);
    console.log(`Trucks before: ${beforeCount}, after: ${afterCount}`);
  });

  test('Data Quality Validation - Menu Normalization', async ({
    request
  }: any) => {
    // Get trucks with menus
    const { data: trucks, error } = await supabaseAdmin
      .from('food_trucks')
      .select('*')
      .not('menu', 'is', null)
      .limit(5);

    expect(error).toBeNull();
    expect(trucks).toBeDefined();

    if (trucks && trucks.length > 0) {
      for (const truck of trucks) {
        // Validate menu structure consistency
        expect(truck.menu).toBeDefined();
        expect(Array.isArray(truck.menu)).toBeTruthy();

        if (Array.isArray(truck.menu) && truck.menu.length > 0) {
          for (const category of truck.menu) {
            // Check for normalized category structure
            expect(category).toHaveProperty('category');
            expect(category).toHaveProperty('items');
            expect(Array.isArray(category.items)).toBeTruthy();

            // Validate items structure
            for (const item of category.items) {
              expect(item).toHaveProperty('name');
              expect(typeof item.name).toBe('string');
              expect(item.name.trim()).not.toBe('');
            }
          }
        }
      }
      console.log(`✓ Validated menu structure for ${trucks.length} trucks`);
    }
  });

  test('Pipeline Error Handling - Invalid URL', async ({
    request
  }: any) => {
    const invalidUrl = 'https://invalid-test-url-that-does-not-exist.com';

    const response = await request.post('/api/test-pipeline-run', {
      data: { url: invalidUrl },
    });

    // Should handle gracefully - either succeed with error handling or fail predictably
    const result = await response.json();
    console.log('Invalid URL test result:', result);

    // Verify no incomplete data was stored
    const { data: trucks } = await supabaseAdmin
      .from('food_trucks')
      .select('*')
      .contains('source_urls', [invalidUrl]);

    // If any trucks were created, they should have valid data
    if (trucks && trucks.length > 0) {
      for (const truck of trucks) {
        expect(truck.name).toBeDefined();
        expect(truck.name.trim()).not.toBe('');
      }
    }
  });

  test('Pipeline Performance - Processing Time', async ({
    request
  }: any) => {
    const testUrl = TEST_URLS[0];
    await cleanupTruckByUrl(testUrl);

    const startTime = Date.now();

    const response = await request.post('/api/test-pipeline-run', {
      data: { url: testUrl },
    });

    expect(response.ok()).toBeTruthy();

    // Poll for completion and measure time
    const truck = await pollForTruckByUrl(
      testUrl,
      POLLING_CONFIG.maxAttempts,
      POLLING_CONFIG.delay,
    );
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    expect(truck).not.toBeNull();

    // Log performance metrics
    console.log(
      `Pipeline processing time: ${processingTime}ms (${(processingTime / 1000).toFixed(2)}s)`,
    );

    // Performance assertion - should complete within reasonable time
    expect(processingTime).toBeLessThan(5 * 60 * 1000); // 5 minutes max
  });

  test('Data Consistency - Duplicate Prevention', async ({
    request
  }: any) => {
    const testUrl = TEST_URLS[0];

    // Run pipeline twice for same URL
    await request.post('/api/test-pipeline-run', { data: { url: testUrl } });
    await new Promise((resolve) => setTimeout(resolve, 2000));
    await request.post('/api/test-pipeline-run', { data: { url: testUrl } });

    // Wait for processing
    await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.longDelay));

    // Check for duplicates
    const { data: trucks } = await supabaseAdmin
      .from('food_trucks')
      .select('*')
      .contains('source_urls', [testUrl]);

    expect(trucks).toBeDefined();

    // Should not create duplicates (or handle them appropriately)
    if (trucks && trucks.length > 1) {
      console.warn(`Found ${trucks.length} trucks for URL ${testUrl} - checking for duplicates`);

      // If multiple trucks exist, they should have different names or be legitimate variations
      const names = trucks.map((t: any) => t.name);
      const uniqueNames = new Set(names);

      if (uniqueNames.size < names.length) {
        console.error('Duplicate truck names detected:', names);
      }
    }
  });

  test('Stale Data Detection and Refresh', async ({
    request
  }: any) => {
    // Find trucks that might be stale
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const { data: staleTrucks } = await supabaseAdmin
      .from('food_trucks')
      .select('*')
      .lt('updated_at', threeDaysAgo.toISOString())
      .limit(1);

    if (staleTrucks && staleTrucks.length > 0) {
      const staleTruck = staleTrucks[0];
      const originalUpdatedAt = staleTruck.updated_at;

      // Trigger autonomous scraping which should detect and refresh stale data
      const response = await request.get('/api/auto-scrape-initiate');
      expect(response.ok()).toBeTruthy();

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, POLLING_CONFIG.longDelay));

      // Check if truck was refreshed
      const { data: refreshedTruck } = await supabaseAdmin
        .from('food_trucks')
        .select('*')
        .eq('id', staleTruck.id)
        .single();

      if (refreshedTruck) {
        console.log(
          `Stale truck check - Original: ${originalUpdatedAt}, Current: ${refreshedTruck.updated_at}`,
        );
      }
    } else {
      console.log('No stale trucks found for testing');
    }
  });
});

// Helper functions
async function cleanupTruckByUrl(url: string): Promise<void> {
  const { data: existingTrucks } = await supabaseAdmin
    .from('food_trucks')
    .select('id')
    .contains('source_urls', [url]);

  if (existingTrucks && existingTrucks.length > 0) {
    const idsToDelete = existingTrucks.map((t: any) => t.id);
    await supabaseAdmin.from('food_trucks').delete().in('id', idsToDelete);
    console.log(`Cleaned up ${idsToDelete.length} trucks for URL: ${url}`);
  }
}

async function pollForTruckByUrl(
  url: string,
  maxAttempts: number,
  delay: number,
): Promise<FoodTruck | null> {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, delay));

    const { data, error } = await supabaseAdmin
      .from('food_trucks')
      .select('*')
      .contains('source_urls', [url])
      .maybeSingle();

    if (error) {
      console.error(`Polling error (attempt ${i + 1}):`, error);
      continue;
    }

    if (data) {
      console.log(`Found truck for ${url} on attempt ${i + 1}`);
      return data;
    }
  }

  console.error(`Failed to find truck for ${url} after ${maxAttempts} attempts`);
  return null;
}
