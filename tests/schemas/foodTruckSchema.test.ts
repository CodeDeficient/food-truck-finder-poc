import { describe, it, expect } from '@jest/globals';
import { z } from 'zod';

// Isolated schema definitions for testing
const MenuItemSchema = z.object({
  name: z.string(),
  description: z.string().optional().default(''),
  price: z.union([z.number(), z.string()]).optional().default(0),
  dietary_tags: z.array(z.string()).optional().default([]),
});

const MenuCategorySchema = z.object({
  name: z.string(),
  items: z.array(MenuItemSchema),
});

const FoodTruckSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  current_location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string(),
      timestamp: z.string().datetime().optional().default(new Date().toISOString()),
    })
    .optional(),
  scheduled_locations: z
    .array(
      z.object({
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zip_code: z.string().optional(),
        lat: z.number().optional(),
        lng: z.number().optional(),
        timestamp: z.string().datetime(),
        start_time: z.string().datetime(),
        end_time: z.string().datetime(),
      }),
    )
    .optional()
    .default([]),
  operating_hours: z
    .object({
      monday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .or(z.object({ closed: z.literal(true) }))
        .default({ closed: true }),
      tuesday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .or(z.object({ closed: z.literal(true) }))
        .default({ closed: true }),
      wednesday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .or(z.object({ closed: z.literal(true) }))
        .default({ closed: true }),
      thursday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .or(z.object({ closed: z.literal(true) }))
        .default({ closed: true }),
      friday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .or(z.object({ closed: z.literal(true) }))
        .default({ closed: true }),
      saturday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .or(z.object({ closed: z.literal(true) }))
        .default({ closed: true }),
      sunday: z
        .object({ open: z.string(), close: z.string(), closed: z.boolean() })
        .or(z.object({ closed: z.literal(true) }))
        .default({ closed: true }),
    })
    .optional()
    .default({
      monday: { closed: true },
      tuesday: { closed: true },
      wednesday: { closed: true },
      thursday: { closed: true },
      friday: { closed: true },
      saturday: { closed: true },
      sunday: { closed: true },
    }),
  menu: z.array(MenuCategorySchema).optional().default([]),
  contact_info: z
    .object({
      email: z.string().email().optional(),
      phone: z.string().optional(),
      website: z.string().url().optional(),
    })
    .optional(),
  social_media: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      tiktok: z.string().optional(),
      yelp: z.string().optional(),
    })
    .optional()
    .default({}),
  source_urls: z.array(z.string().url()).optional().default([]),
  data_quality_score: z.number().min(0).max(1).optional().default(0.5),
  verification_status: z.enum(['pending', 'verified', 'rejected']).optional().default('pending'),
});

/**
 * Schema Validation Tests for FoodTruckSchema
 */
describe('FoodTruckSchema Validation', () => {
  it('should pass with valid input', () => {
    const validData = {
      name: 'Awesome Truck',
      description: 'Best tacos in town!',
      contact_info: { email: 'contact@truckland.com' },
      operating_hours: {
        monday: { open: '09:00', close: '17:00', closed: false },
        tuesday: { closed: true },
      },
    };
    expect(() => FoodTruckSchema.parse(validData)).not.toThrow();
  });

  it('should fail without mandatory name', () => {
    const invalidData = {
      description: 'No name truck',
    };
    expect(() => FoodTruckSchema.parse(invalidData)).toThrow();
  });

  it('should set defaults for optional fields', () => {
    const dataWithDefaults = {
      name: 'Default Truck',
    };
    expect(FoodTruckSchema.parse(dataWithDefaults).operating_hours).toBeDefined();
  });
});
