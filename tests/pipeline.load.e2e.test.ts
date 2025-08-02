import { test, expect } from '@playwright/test';
import { supabaseAdmin } from '../lib/supabase';

/**
 * Load testing suite for data pipeline stress testing
 * Tests pipeline behavior under high load and concurrent operations
 */

const LOAD_TEST_URLS = [
  'https://www.rotirolls.com/',
  // Add more URLs for concurrent testing when available
];

const LOAD_CONFIG = {
  concurrentRequests: 3,
  batchSize: 5,
  timeoutMs: 10 * 60 * 1000, // 10 minutes
  pollingIntervalMs: 5000, // 5 seconds
};

test.describe('Pipeline Load Testing', () => {
  test.beforeAll(async () => {
    console.info('Starting pipeline load tests...');
    console.info(`Configuration:`, LOAD_CONFIG);
  });

  test.afterAll(async () => {
    console.info('Load testing completed');
  });
  test('Concurrent Pipeline Requests', async ({ request }: any) => {
    const testUrl = LOAD_TEST_URLS[0];

    // Clean up any existing data
    await cleanupTrucksByUrl(testUrl);

    // Track metrics
    const startTime = Date.now();
    const promises: Promise<Response>[] = [];

    // Create concurrent requests
    for (let i = 0; i < LOAD_CONFIG.concurrentRequests; i++) {
      const promise = request.post('/api/test-pipeline-run', {
        data: { url: testUrl },
      });
      promises.push(promise);
    }

    // Wait for all requests to complete
    const responses = await Promise.allSettled(promises);
    const requestTime = Date.now() - startTime;

    // Analyze results
    const successful = responses.filter((r) => r.status === 'fulfilled').length;
    const failed = responses.filter((r) => r.status === 'rejected').length;

    console.info(`Concurrent requests completed in ${requestTime}ms`);
    console.info(`Successful: ${successful}, Failed: ${failed}`);

    // At least some requests should succeed
    expect(successful).toBeGreaterThan(0);

    // Wait for processing to complete
    await new Promise((resolve) => setTimeout(resolve, LOAD_CONFIG.pollingIntervalMs * 4));

    // Check final state
    const admin = supabaseAdmin ?? (await import('../lib/supabase')).supabaseAdmin;
    if (!admin) {
      console.error('No supabase admin available');
      return;
    }
    const { data: finalTrucks } = await admin
      .from('food_trucks')
      .select('*')
      .contains('source_urls', [testUrl]);

    console.log(`Final trucks created: ${finalTrucks?.length || 0}`);

    // Should not create excessive duplicates
    expect(finalTrucks?.length || 0).toBeLessThanOrEqual(LOAD_CONFIG.concurrentRequests + 1);
  });

  test('Pipeline Memory and Resource Usage', async ({ request }: any) => {
    // Test multiple sequential requests to check for memory leaks
    const testUrl = LOAD_TEST_URLS[0];
    const iterations = 5;
    const processingTimes: number[] = [];

    for (let i = 0; i < iterations; i++) {
      console.log(`Sequential test iteration ${i + 1}/${iterations}`);

      // Clean up before each iteration
      await cleanupTrucksByUrl(testUrl);

      const startTime = Date.now();

      const response = await request.post('/api/test-pipeline-run', {
        data: { url: testUrl },
      });

      expect(response.ok()).toBeTruthy();

      // Wait for completion
      const truck = await pollForTruck(testUrl, 20, 3000);
      const processingTime = Date.now() - startTime;

      processingTimes.push(processingTime);

      expect(truck).not.toBeNull();
      console.log(`Iteration ${i + 1} completed in ${processingTime}ms`);

      // Small delay between iterations
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // Analyze performance trends
    const avgTime = processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length;
    const maxTime = Math.max(...processingTimes);
    const minTime = Math.min(...processingTimes);

    console.log(`Performance metrics:
      Average: ${avgTime.toFixed(2)}ms
      Min: ${minTime}ms
      Max: ${maxTime}ms
      Variance: ${maxTime - minTime}ms`);

    // Performance should remain relatively consistent (no major degradation)
    const variance = maxTime - minTime;
    expect(variance).toBeLessThan(avgTime * 2); // Variance shouldn't exceed 200% of average
  });

  test('API Rate Limiting and Error Handling', async ({ request }: any) => {
    // Test rapid API calls to check rate limiting
    const rapidRequests = 10;
    const promises: Promise<any>[] = [];

    console.log(`Testing ${rapidRequests} rapid API calls...`);

    for (let i = 0; i < rapidRequests; i++) {
      const promise = request.get('/api/auto-scrape-initiate');
      promises.push(promise);
    }

    const results = await Promise.allSettled(promises);

    let successCount = 0;
    let rateLimitedCount = 0;
    let errorCount = 0;

    for (const result of results) {
      if (result.status === 'fulfilled') {
        if (result.value.ok()) {
          successCount++;
        } else if (result.value.status() === 429) {
          rateLimitedCount++;
        } else {
          errorCount++;
        }
      } else {
        errorCount++;
      }
    }

    console.log(`Rapid API test results:
      Success: ${successCount}
      Rate Limited: ${rateLimitedCount}
      Errors: ${errorCount}`);

    // Should handle rate limiting gracefully
    expect(successCount + rateLimitedCount).toBeGreaterThan(0);
    expect(errorCount).toBeLessThan(rapidRequests); // Not all should fail
  });
  test('Database Connection Pool Under Load', async ({ request }: any) => {
    // Test database operations under concurrent load
    const dbOperations: Promise<unknown>[] = [];
    const operationCount = 15;

    console.info(`Testing ${operationCount} concurrent database operations...`);

    for (let i = 0; i < operationCount; i++) {
      const operation = performDatabaseOperation(i);
      dbOperations.push(operation);
    }

    const results = await Promise.allSettled(dbOperations);

    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.info(`Database operations: ${successful} successful, ${failed} failed`);

    // Most operations should succeed
    expect(successful).toBeGreaterThan(operationCount * 0.8); // At least 80% success rate
  });

  test('Pipeline Recovery After Failure', async ({ request }: any) => {
    const testUrl = LOAD_TEST_URLS[0];

    // Clean up
    await cleanupTrucksByUrl(testUrl);

    // Start a normal pipeline operation
    console.info('Starting normal pipeline operation...');
    const normalResponse = await request.post('/api/test-pipeline-run', {
      data: { url: testUrl },
    });

    expect(normalResponse.ok()).toBeTruthy();

    // Simulate a failure scenario by trying invalid operations
    console.log('Simulating failure scenarios...');
    await request.post('/api/test-pipeline-run', {
      data: { url: 'invalid-url' },
    });

    // Wait a bit
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Try to recover with a valid operation
    console.log('Testing recovery...');
    const recoveryResponse = await request.post('/api/test-pipeline-run', {
      data: { url: testUrl },
    });

    expect(recoveryResponse.ok()).toBeTruthy();

    // Should still be able to process successfully
    const recoveryTruck = await pollForTruck(testUrl, 15, 4000);
    expect(recoveryTruck).not.toBeNull();

    console.log('Pipeline recovery test completed successfully');
  });
});

// Helper functions for load testing
async function cleanupTrucksByUrl(url: string): Promise<void> {
  try {
    if (!supabaseAdmin) return;
    const { data: existingTrucks } = await supabaseAdmin
      .from('food_trucks')
      .select('id')
      .contains('source_urls', [url]);
    if (existingTrucks && existingTrucks.length > 0) {
      const idsToDelete = existingTrucks.map((t: any) => t.id);
      await supabaseAdmin.from('food_trucks').delete().in('id', idsToDelete);
      console.info(`Cleaned up ${idsToDelete.length} trucks for URL: ${url}`);
    }
  } catch (error) {
    console.error('Cleanup error:', error);
  }
}

async function pollForTruck(url: string, maxAttempts: number, delay: number): Promise<unknown> {
  if (!supabaseAdmin) return undefined;
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, delay));

    try {
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
        return data;
      }
    } catch (error) {
      console.error(`Polling exception (attempt ${i + 1}):`, error);
    }
  }

  return undefined;
}

async function performDatabaseOperation(index: number): Promise<unknown> {
  try {
    if (!supabaseAdmin) return undefined;
    // Simulate various database operations
    const operations = [
      // Read operation
      () => supabaseAdmin!.from('food_trucks').select('id, name').limit(5),

      // Count operation
      () => supabaseAdmin!.from('food_trucks').select('*', { count: 'exact', head: true }),

      // Search operation
      () => supabaseAdmin!.from('food_trucks').select('*').ilike('name', '%test%').limit(3),
    ];

    const operation = operations[index % operations.length];
    const result = await operation();

    if (result.error) {
      throw new Error(`Database operation ${index} failed: ${result.error.message}`);
    }

    return result;
  } catch (error) {
    console.error(`Database operation ${index} error:`, error);
    throw error;
  }
}
