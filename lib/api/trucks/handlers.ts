import { NextResponse } from 'next/server';
import { FoodTruckService } from '@/lib/supabase';
import { FoodTruck } from '@/lib/types';

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

  return NextResponse.json({
    trucks,
    total,
    limit,
    offset,
    hasMore: offset + limit < (total ?? 0),
    summary: {
      totalTrucks: total,
      averageQuality:
        trucks && trucks.length > 0
          ? trucks.reduce((acc, t) => acc + (t.data_quality_score ?? 0), 0) / trucks.length
          : 0,
      lastUpdated:
        trucks && trucks.length > 0
          ? Math.max(...trucks.map((t) => new Date(t.updated_at).getTime()))
          : 0,
    },
  });
}

export async function handlePostTruck(truckData: any) {
  const newTruck = await FoodTruckService.createTruck(truckData);
  return NextResponse.json(
    {
      message: 'Food truck created successfully',
      truck: newTruck,
    },
    { status: 201 },
  );
}

export async function handlePutTruck(id: string, updates: any) {
  const updatedTruck = await FoodTruckService.updateTruck(id, updates);
  return NextResponse.json({
    message: 'Food truck updated successfully',
    truck: updatedTruck,
  });
}
