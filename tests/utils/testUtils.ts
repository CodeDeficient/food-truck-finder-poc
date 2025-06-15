// tests/utils/testUtils.ts
// @ts-expect-error TS(2792): Cannot find module '@supabase/supabase-js'. Did yo... Remove this comment to see the full error message
import { SupabaseClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '../../lib/supabase';
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
export const TestUtils = {
  /**
   * Make a test HTTP request to the API
   */
  async makeTestRequest(url: string, config: TestRequestConfig): Promise<TestAPIResponse> {
    try {
      const response = await fetch(url, {
        method: config.method,
        headers: {
          'Content-Type': 'application/json',
          ...config.headers,
        },
        body: config.body,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error(`HTTP ${response.status}: ${response.statusText}`);
        return {
          success: false,
          error: `HTTP ${response.status}: ${response.statusText}`,
          data,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Test request failed:', errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    }
  },

  /**
   * Create test food truck data
   */
  createTestFoodTruck(
    overrides: Partial<FoodTruck> = {},
  ): Omit<FoodTruck, 'id' | 'created_at' | 'updated_at'> {
    return {
      name: 'Test Food Truck',
      description: 'A test food truck serving delicious food',
      current_location: {
        lat: 32.7767,
        lng: -79.9311,
        address: '123 Test Street, Charleston, SC',
        timestamp: new Date().toISOString(),
      },
      scheduled_locations: [],
      contact_info: {
        phone: '555-0123',
        email: 'test@foodtruck.com',
        website: 'https://testfoodtruck.com',
      },
      social_media: {
        instagram: 'testfoodtruck',
        facebook: 'testfoodtruckpage',
      },
      menu: [
        {
          name: 'Main Items',
          items: [
            {
              name: 'Test Burger',
              description: 'A delicious test burger',
              price: 12.99,
              dietary_tags: [],
            },
          ],
        },
      ],
      operating_hours: {
        monday: { open: '11:00', close: '21:00', closed: false },
        tuesday: { open: '11:00', close: '21:00', closed: false },
        wednesday: { open: '11:00', close: '21:00', closed: false },
        thursday: { open: '11:00', close: '21:00', closed: false },
        friday: { open: '11:00', close: '22:00', closed: false },
        saturday: { open: '11:00', close: '22:00', closed: false },
        sunday: { open: '12:00', close: '20:00', closed: false },
      },
      cuisine_type: ['American'],
      price_range: '$|$$,$$$',
      specialties: ['Burgers', 'Fries'],
      data_quality_score: 0.8,
      verification_status: 'pending',
      source_urls: ['https://testfoodtruck.com'],
      last_scraped_at: new Date().toISOString(),
      is_active: true,
      ...overrides,
    };
  },

  /**
   * Clean up test data from the database
   */
  async cleanupTestData(): Promise<void> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      // Delete test food trucks
      const { error: trucksError } = await supabaseAdmin
        .from('food_trucks')
        .delete()
        .like('name', '%Test%');

      if (trucksError) {
        console.error('Error cleaning up test food trucks:', trucksError);
      }

      // Delete test discovered URLs
      const { error: urlsError } = await supabaseAdmin
        .from('discovered_urls')
        .delete()
        .like('url', '%test%');

      if (urlsError) {
        console.error('Error cleaning up test discovered URLs:', urlsError);
      }

      // Delete test scraping jobs
      const { error: jobsError } = await supabaseAdmin
        .from('scraping_jobs')
        .delete()
        .like('target_url', '%test%');

      if (jobsError) {
        console.error('Error cleaning up test scraping jobs:', jobsError);
      }

      console.info('Test data cleanup completed');
    } catch (error) {
      console.error('Error during test cleanup:', error);
    }
  },

  /**
   * Insert test food truck into database
   */
  async insertTestFoodTruck(truckData?: Partial<FoodTruck>): Promise<FoodTruck | undefined> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      const testTruck = this.createTestFoodTruck(truckData);

      const { data, error } = await supabaseAdmin
        .from('food_trucks')
        .insert(testTruck)
        .select()
        .single();

      if (error) {
        console.error('Error inserting test food truck:', error);
        return undefined;
      }

      return data as FoodTruck;
    } catch (error) {
      console.error('Error inserting test food truck:', error);
      return undefined;
    }
  },

  /**
   * Wait for a condition to be met with timeout
   */
  async waitForCondition(
    condition: () => Promise<boolean>,
    timeoutMs: number = 10_000,
    intervalMs: number = 500,
  ): Promise<boolean> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        if (await condition()) {
          return true;
        }
      } catch (error) {
        console.error('Error checking condition:', error);
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    return false;
  },

  /**
   * Generate test API payload
   */
  generateTestPayload(type: 'scrape' | 'pipeline' | 'discovery'): Record<string, unknown> {
    switch (type) {
      case 'scrape':
        return {
          url: 'https://test-food-truck.com',
          priority: 5,
        };
      case 'pipeline':
        return {
          action: 'full',
          config: {
            maxUrls: 10,
            cities: ['Charleston'],
          },
        };
      case 'discovery':
        return {
          cities: ['Charleston', 'Columbia'],
          maxUrls: 20,
        };
      default:
        return {};
    }
  },
};

/**
 * Database utilities for testing
 */
export const DatabaseTestUtils = {
  /**
   * Get database client for testing
   */
  getClient(): SupabaseClient {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }
    return supabaseAdmin;
  },

  /**
   * Check if database is accessible
   */
  async checkConnection(): Promise<boolean> {
    try {
      if (!supabaseAdmin) {
        return false;
      }

      const { error } = await supabaseAdmin.from('food_trucks').select('id').limit(1);

      return !error;
    } catch {
      return false;
    }
  },

  /**
   * Get test data counts
   */
  async getTestDataCounts(): Promise<{
    foodTrucks: number;
    discoveredUrls: number;
    scrapingJobs: number;
  }> {
    try {
      if (!supabaseAdmin) {
        throw new Error('Supabase admin client not available');
      }

      const [trucksResult, urlsResult, jobsResult] = await Promise.all([
        supabaseAdmin.from('food_trucks').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('discovered_urls').select('id', { count: 'exact', head: true }),
        supabaseAdmin.from('scraping_jobs').select('id', { count: 'exact', head: true }),
      ]);

      return {
        foodTrucks: trucksResult.count || 0,
        discoveredUrls: urlsResult.count || 0,
        scrapingJobs: jobsResult.count || 0,
      };
    } catch (error) {
      console.error('Error getting test data counts:', error);
      return {
        foodTrucks: 0,
        discoveredUrls: 0,
        scrapingJobs: 0,
      };
    }
  },
};
