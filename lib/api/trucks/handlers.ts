import { NextResponse } from 'next/server';
import { FoodTruckService } from '@/lib/supabase';

export async function handleGetTruckById(id: string) {
  const truck = await FoodTruckService.getTruckById(id);
  return NextResponse.json({ truck });
}

export async function handleGetTrucksByLocation(lat: string, lng: string, radius: string) {
  const userLat = Number.parseFloat(lat);
  const userLng = Number.parseFloat(lng);
  const radiusKm = Number.parseFloat(radius);

  const nearbyTrucks = await FoodTruckService.getTrucksByLocation(userLat, userLng, radiusKm);

  return NextResponse.json({
    trucks: nearbyTrucks,
    total: nearbyTrucks.length,
    limit: nearbyTrucks.length, // Assuming no pagination for location-based
    offset: 0,
    hasMore: false,
  });
}

export async function handleGetAllTrucks(limit: number, offset: number) {
  const { trucks, total } = await FoodTruckService.getAllTrucks(limit, offset);

  const hasTrucks = Array.isArray(trucks) && trucks.length > 0;

  return NextResponse.json({
    trucks,
    total,
    limit,
    offset,
    hasMore: offset + limit < (total ?? 0),
    summary: {
      totalTrucks: total,
      averageQuality:
        hasTrucks
          ? trucks.reduce((acc, t) => acc + (t.data_quality_score ?? 0), 0) / trucks.length
          : 0,
      lastUpdated:
        hasTrucks
          ? Math.max(...trucks.map((t) => new Date(t.updated_at).getTime()))
          : 0,
    },
  });
}

export async function handlePostTruck(truckData: unknown) {
  const newTruck = await FoodTruckService.createTruck(truckData as Partial<import('@/lib/supabase').FoodTruck>);
  return NextResponse.json(
    {
      message: 'Food truck created successfully',
      truck: newTruck,
    },
    { status: 201 },
  );
}

export async function handlePutTruck(id: string, updates: unknown) {
  const updatedTruck = await FoodTruckService.updateTruck(id, updates as Partial<import('@/lib/supabase').FoodTruck>);
  return NextResponse.json({
    message: 'Food truck updated successfully',
    truck: updatedTruck,
  });
}
