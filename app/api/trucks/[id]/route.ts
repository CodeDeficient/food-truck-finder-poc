import { type NextRequest, NextResponse } from 'next/server';
import { FoodTruckService, type FoodTruck } from '@/lib/supabase';
import { verifyAdminAccess } from '@/lib/auth/authHelpers';
 
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const truck = await FoodTruckService.getTruckById(params.id);

    if (truck == undefined) {
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
    const hasAccess = await verifyAdminAccess(request);
    if (!hasAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
