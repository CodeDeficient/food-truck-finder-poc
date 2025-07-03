// @ts-expect-error TS(2792): Cannot find module '@playwright/test'. Did you mea... Remove this comment to see the full error message
import { test, expect } from '@playwright/test';
import { cleanupTestData, setupTestData } from './utils/testSetup';

test.describe('Autonomous Discovery and Ingestion Pipeline', () => {
  test.beforeAll(async () => {
    // Setup test environment
    await setupTestData();
  });

  test.afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
  });

  test('should handle pipeline initiation endpoint', async ({ request }: any) => {
    // Test that the endpoint responds correctly
    const response = await request.get('/api/auto-scrape-initiate');

    // The endpoint should respond even with mock data
    expect(response.status()).toBeLessThan(500); // Should not be a server error

    // If it's a 200, check the structure
    if (response.status() === 200) {
      const json = await response.json();
      expect(json).toHaveProperty('message');
    }
  });

  test('should handle test pipeline endpoint', async ({ request }: any) => {
    // Test the test pipeline endpoint
    const response = await request.post('/api/test-pipeline-run', {
      data: {
        url: 'https://test-food-truck.com',
        testMode: true,
      },
    });

    // Should respond without throwing errors
    expect(response.status()).toBeLessThan(500);
  });
  test('should handle integration test endpoint', async ({ request }: any) => {
    // Test the integration endpoint
    const response = await request.get('/api/test-integration');

    // Should respond without throwing errors
    expect(response.status()).toBeLessThan(500);

    if (response.status() === 200) {
      const json = await response.json();
      expect(json).toHaveProperty('message');
      expect(json).toHaveProperty('description');
      expect(json).toHaveProperty('usage');
    }
  });

  test('should validate pipeline error handling', async ({ request }: any) => {
    // Test pipeline with invalid data
    const response = await request.post('/api/test-pipeline-run', {
      data: {
        url: 'invalid-url',
        testMode: true,
      },
    });

    // Should handle invalid input gracefully
    expect(response.status()).toBeLessThan(500);
  });
});
