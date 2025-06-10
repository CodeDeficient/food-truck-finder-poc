import { type NextRequest, NextResponse } from 'next/server';
import { FoodTruckService } from '@/lib/supabase';
import { z, type infer as ZInfer } from 'zod';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');
  const radius = searchParams.get('radius') || '5';
  const limit = Number.parseInt(searchParams.get('limit') || '50');
  const offset = Number.parseInt(searchParams.get('offset') || '0');

  try {
    // Get specific truck by ID
    if (id) {
      const truck = await FoodTruckService.getTruckById(id);
      return NextResponse.json({ truck });
    }

    // Get trucks by location
    if (lat && lng) {
      const userLat = Number.parseFloat(lat);
      const userLng = Number.parseFloat(lng);
      const radiusKm = Number.parseFloat(radius);

      const nearbyTrucks = await FoodTruckService.getTrucksByLocation(userLat, userLng, radiusKm);

      return NextResponse.json({
        trucks: nearbyTrucks,
        total: nearbyTrucks.length,
        limit,
        offset,
        hasMore: false, // Location-based queries don't use pagination
      });
    }

    // Get all trucks with pagination
    const { trucks, total } = await FoodTruckService.getAllTrucks(limit, offset);

    return NextResponse.json({
      trucks,
      total,
      limit,
      offset,
      hasMore: offset + limit < (total || 0),
      summary: {
        totalTrucks: total,
        averageQuality:
          trucks && trucks.length > 0
            ? trucks.reduce((acc, t) => acc + (t.data_quality_score || 0), 0) / trucks.length
            : 0,
        lastUpdated:
          trucks && trucks.length > 0
            ? Math.max(...trucks.map((t) => new Date(t.updated_at).getTime()))
            : 0,
      },
    });
  } catch (error) {
    console.error('Error fetching food trucks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
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

    const newTruck = await FoodTruckService.createTruck(validatedData);

    return NextResponse.json(
      {
        message: 'Food truck created successfully',
        truck: newTruck,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating food truck:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create food truck' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = (await request.json()) as ZInfer<typeof UpdateFoodTruckSchema>;
    const validatedData = UpdateFoodTruckSchema.parse(body);
    const { id, ...updates } = validatedData;

    const updatedTruck = await FoodTruckService.updateTruck(id, updates);

    return NextResponse.json({
      message: 'Food truck updated successfully',
      truck: updatedTruck,
    });
  } catch (error) {
    console.error('Error updating food truck:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update food truck' }, { status: 500 });
  }
}
