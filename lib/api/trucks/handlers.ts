import { NextResponse } from 'next/server';
import { FoodTruckService } from '@/lib/supabase';

export async function handleGetTruckById(id: string) {
  const truckResult = await FoodTruckService.getTruckById(id);
  if ('error' in truckResult) {
    return NextResponse.json({ error: truckResult.error }, { status: 500 });
  }
  return NextResponse.json({ truck: truckResult });
}

export async function handleGetTrucksByLocation(lat: string, lng: string, radius: string) {
  const userLat = Number.parseFloat(lat);
  const userLng = Number.parseFloat(lng);
  const radiusKm = Number.parseFloat(radius);

  const nearbyTrucks = await FoodTruckService.getTrucksByLocation(userLat, userLng, radiusKm);
  if ('error' in nearbyTrucks) {
    return NextResponse.json(
      { error: "That didn't work, please try again later." },
      { status: 500 },
    );
  }
  return NextResponse.json({
    trucks: nearbyTrucks,
    total: nearbyTrucks.length,
    limit: nearbyTrucks.length, // Assuming no pagination for location-based
    offset: 0,
    hasMore: false,
  });
}

export async function handleGetAllTrucks(limit: number, offset: number) {
  const { trucks, total, error } = await FoodTruckService.getAllTrucks(limit, offset);
  if (error != undefined && error !== '') {
    return NextResponse.json(
      { error: "That didn't work, please try again later." },
      { status: 500 },
    );
  }
  const hasTrucks = Array.isArray(trucks) && trucks.length > 0;
  return NextResponse.json({
    trucks,
    total,
    limit,
    offset,
    hasMore: offset + limit < (total ?? 0),
    summary: {
      totalTrucks: total,
      averageQuality: hasTrucks
        ? trucks.reduce((acc, t) => acc + (t.data_quality_score ?? 0), 0) / trucks.length
        : 0,
      lastUpdated: hasTrucks ? Math.max(...trucks.map((t) => new Date(t.updated_at).getTime())) : 0,
    },
  });
}

export async function handlePostTruck(truckData: unknown) {
  try {
    const newTruckResult = await FoodTruckService.createTruck(
      truckData as Partial<import('@/lib/supabase').FoodTruck>,
    );
    if ('error' in newTruckResult) {
      console.error('Error creating truck:', newTruckResult.error);
      return NextResponse.json({ error: newTruckResult.error }, { status: 500 });
    }
    return NextResponse.json(
      {
        message: 'Food truck created successfully',
        truck: newTruckResult,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error in handlePostTruck:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while creating the food truck.' },
      { status: 500 },
    );
  }
}

export async function handlePutTruck(id: string, updates: unknown) {
  try {
    const updatedTruckResult = await FoodTruckService.updateTruck(
      id,
      updates as Partial<import('@/lib/supabase').FoodTruck>,
    );
    if ('error' in updatedTruckResult) {
      console.error('Error updating truck:', updatedTruckResult.error);
      return NextResponse.json({ error: updatedTruckResult.error }, { status: 500 });
    }
    return NextResponse.json({
      message: 'Food truck updated successfully',
      truck: updatedTruckResult,
    });
  } catch (error) {
    console.error('Error in handlePutTruck:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the food truck.' },
      { status: 500 },
    );
  }
}
