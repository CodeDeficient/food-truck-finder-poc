import { type NextRequest, NextResponse } from 'next/server';
import { withValidation } from '@/lib/middleware/withValidation';
import {
  handleGetTruckById,
  handleGetTrucksByLocation,
  handleGetAllTrucks,
  handlePostTruck,
  handlePutTruck,
} from '@/lib/api/trucks/handlers';
import { CreateFoodTruckSchema, UpdateFoodTruckSchema } from '@/lib/validation/schemas/v1/api';

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


export const POST = withValidation(CreateFoodTruckSchema, async (_request: NextRequest, _params, validatedData) => {
  return handlePostTruck(validatedData);
});

export const PUT = withValidation(UpdateFoodTruckSchema, async (_request: NextRequest, _params, { id, ...updates }) => {
  return handlePutTruck(id, updates);
});
