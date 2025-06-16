// @ts-expect-error TS(2792): Cannot find module 'next/server'. Did you mean to ... Remove this comment to see the full error message
import { type NextRequest, NextResponse } from 'next/server';
import { FoodTruckService, FoodTruck } from '@/lib/supabase';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const truck = await FoodTruckService.getTruckById(params.id);

    if (truck === undefined || truck === null) {
      return NextResponse.json({ error: 'Food truck not found' }, { status: 404 });
    }

    return NextResponse.json({ truck });
  } catch (error) {
    console.error('Error fetching truck:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = (await request.json()) as Partial<FoodTruck>;
    const updatedTruck = await FoodTruckService.updateTruck(params.id, body);

    return NextResponse.json({
      message: 'Food truck updated successfully',
      truck: updatedTruck,
    });
  } catch (error) {
    console.error('Error updating truck:', error);
    return NextResponse.json({ error: 'Failed to update food truck' }, { status: 500 });
  }
}
