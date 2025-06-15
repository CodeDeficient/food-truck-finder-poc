// tests/utils/testSetup.ts
// @ts-expect-error TS(2792): Cannot find module 'dotenv'. Did you mean to set t... Remove this comment to see the full error message
import dotenv from 'dotenv';
import { supabaseAdmin } from '../../lib/supabase';

// Load environment variables for tests
dotenv.config({ path: '.env.local' });

// Test environment configuration
export const TEST_CONFIG = {
  apiBaseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  testTimeout: 30_000,
  maxRetries: 3,
  cleanupTimeout: 5_000,
};

// Mock food truck data for testing
export const MOCK_FOOD_TRUCK = {
  name: 'Test Food Truck',
  description: 'A test food truck for integration testing',
  current_location: {
    lat: 32.7767,
    lng: -79.9311,
    address: '123 Test Street, Charleston, SC 29401',
    timestamp: new Date().toISOString(),
  },
  contact_info: {
    phone: '555-0123',
    email: 'test@example.com',
    website: 'https://testfoodtruck.com',
  },
  social_media: {
    instagram: 'test_food_truck',
    facebook: 'testfoodtruck',
  },
  menu: [
    {
      category: 'Main Items',
      items: [
        {
          name: 'Test Burger',
          description: 'A delicious test burger',
          price: 12.99,
          dietary_tags: ['gluten-free'],
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
  source_urls: ['https://testfoodtruck.com'],
  last_scraped_at: new Date().toISOString(),
  is_active: true,
};

/**
 * Clean up test data from database
 */
export async function cleanupTestData(): Promise<void> {
  console.info('Starting test data cleanup...');

  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    // Clean up test food trucks
    await supabaseAdmin.from('food_trucks').delete().like('name', '%Test%');

    // Clean up test discovered URLs
    await supabaseAdmin.from('discovered_urls').delete().like('url', '%test%');

    // Clean up test scraping jobs
    await supabaseAdmin.from('scraping_jobs').delete().like('target_url', '%test%');

    console.info('Test data cleanup completed');
  } catch (error) {
    console.error('Error during test cleanup:', error);
  }
}

/**
 * Set up test data in database
 */
export async function setupTestData(): Promise<void> {
  console.info('Setting up test data...');

  try {
    if (!supabaseAdmin) {
      throw new Error('Supabase admin client not available');
    }

    // Insert mock food truck
    await supabaseAdmin.from('food_trucks').insert(MOCK_FOOD_TRUCK);

    console.info('Test data setup completed');
  } catch (error) {
    console.error('Error during test setup:', error);
  }
}

/**
 * Wait for condition with timeout
 */
export async function waitForCondition(
  condition: () => Promise<boolean>,
  timeoutMs: number = 10_000,
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (await condition()) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return false;
}

/**
 * Global setup function for Playwright tests
 * This ensures environment variables are loaded before any tests run
 */
export default async function globalSetup(): Promise<void> {
  console.info('🔧 Setting up test environment...');

  // Verify environment variables are loaded
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
  }

  console.info('✅ Environment variables loaded successfully');
  console.info('✅ Test environment setup complete');
}
