import { type NextRequest, NextResponse } from 'next/server';
import { z, type infer as ZInfer } from 'zod';
import {
  handleGetTruckById,
  handleGetTrucksByLocation,
  handleGetAllTrucks,
  handlePostTruck,
  handlePutTruck,
} from '@/lib/api/trucks/handlers';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') ?? '5';
  const limit = Number.parseInt(searchParams.get('limit') ?? '50');
  const offset = Number.parseInt(searchParams.get('offset') ?? '0');

  try {
    if (id !== null && id.length > 0) {
      return await handleGetTruckById(id);
    }

    if (lat !== null && lat.length > 0 && lng !== null && lng.length > 0) {
      return await handleGetTrucksByLocation(lat, lng, radius);
    }

    return await handleGetAllTrucks(limit, offset);
  } catch (error: unknown) {
    console.error('Error fetching food trucks:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

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

const UpdateFoodTruckSchema = FoodTruckSchema.partial().extend({
  id: z.string().uuid('Invalid truck ID format').min(1, 'Truck ID is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ZInfer<typeof FoodTruckSchema>;
    const validatedData = FoodTruckSchema.parse(body);
    return await handlePostTruck(validatedData);
  } catch (error: unknown) {
    console.error('Error creating food truck:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as ZInfer<typeof UpdateFoodTruckSchema>;
    const validatedData = UpdateFoodTruckSchema.parse(body);
    const { id, ...updates } = validatedData;
    return await handlePutTruck(id, updates);
  } catch (error: unknown) {
    console.error('Error updating food truck:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    );
  }
}
