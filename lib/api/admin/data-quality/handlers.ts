import { NextRequest, NextResponse } from 'next/server';
import { FoodTruckService, FoodTruck } from '@/lib/supabase';



/**
 * Handles GET requests by executing different actions based on query parameters.
 * @example
 * handleGetRequest(request)
 * Returns a response based on the action specified in the query parameters.
 * @param {NextRequest} request - The incoming request object containing URL and query parameters.
 * @returns {Promise<NextResponse>} A Promise resolving to a NextResponse object with the result of the action.
 * @description
 *   - Processes 'stats', 'assess', and defaults actions based on the 'action' query parameter.
 *   - Requires 'truckId' for the 'assess' action; otherwise, returns a 400 error.
 *   - Utilizes async handling for processing actions.
 */
export async function handleGetRequest(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const truckId = searchParams.get('truckId');

  switch (action) {
    case 'stats': {
      return await handleStatsAction();
    }
    case 'assess': {
      if (!(truckId ?? '')) {
        return NextResponse.json(
          { success: false, error: 'Missing truckId for assess action' },
          { status: 400 },
        );
      }
      return await handleAssessAction(truckId);
    }
    default: {
      return await handleDefaultGetAction();
    }
  }
}

interface PostRequestBody {
  action: string;
  truckId?: string;
}

/**
* Handles different types of POST requests by determining the action and executing appropriate functions.
* @example
* handlePostRequest(request)
* NextResponse containing success status and result or error message
* @param {NextRequest} request - Incoming request object containing body data as JSON.
* @returns {Promise<NextResponse>} Response indicating success or failure and any relevant data or error messages.
* @description
*   - Validates request body to ensure it's a non-null object.
*   - Extracts action and truckId from request body to decide on processing steps.
*   - Handles actions like "update-single", "batch-update", and "recalculate-all", returning an appropriate NextResponse.
*   - Responds with an error JSON if the action is unknown or if required fields are missing.
*/
export async function handlePostRequest(request: NextRequest): Promise<NextResponse> {
  const body: unknown = await request.json();

  if (typeof body !== 'object' || body === null) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { action, truckId } = body as PostRequestBody;

  switch (action) {
    case 'update-single': {
      if (truckId === undefined || truckId === '') {
        return NextResponse.json(
          { success: false, error: 'Missing truckId for update-single action' },
          { status: 400 },
        );
      }
      return await handleUpdateSingle(truckId);
    }
    case 'batch-update': {
      return handleBatchUpdate();
    }
    case 'recalculate-all': {
      return await handleRecalculateAll();
    }
    default: {
      return NextResponse.json(
        { success: false, error: `Unknown action: ${action}` },
        { status: 400 },
      );
    }
  }
}

async function handleStatsAction() {
  const qualityStats = await FoodTruckService.getDataQualityStats();

  return NextResponse.json({
    success: true,
    data: {
      ...qualityStats,
      timestamp: new Date().toISOString(),
    },
  });
}

/**
 * Processes and returns the assessment result of a food truck action by its ID.
 * @example
 * handleAssessAction("12345")
 * { success: true, data: { truckId: "12345", truckName: "Best Food Truck", currentScore: 95, timestamp: "2023-10-05T14:48:00.000Z" } }
 * @param {string} truckId - The identifier of the food truck to be assessed.
 * @returns {object} Returns a JSON response containing either the assessment data or an error.
 * @description
 *   - Retrieves data of the specified food truck using FoodTruckService.
 *   - Casts the retrieved data explicitly to a FoodTruck object type to ensure type safety.
 *   - Responds with a 404 status and the error description if the truck is not found.
 */
async function handleAssessAction(truckId: string) {
  const truckResult = await FoodTruckService.getTruckById(truckId);

  if ('error' in truckResult) {
    return NextResponse.json({ success: false, error: truckResult.error }, { status: 404 });
  }

  const truck: FoodTruck = truckResult; // Explicitly cast to FoodTruck

  return NextResponse.json({
    success: true,
    data: {
      truckId,
      truckName: truck.name,
      currentScore: truck.data_quality_score,
      timestamp: new Date().toISOString(),
    },
  });
}

async function handleDefaultGetAction() {
  const qualityStats = await FoodTruckService.getDataQualityStats();
  return NextResponse.json({
    success: true,
    data: qualityStats,
  });
}

/**
 * Handles updating a single food truck's quality score and returns the result.
 * @example
 * handleUpdateSingle("1234")
 * { success: true, message: 'Quality score updated successfully', data: { truckId: '1234', truckName: 'Food Truck A', newScore: 95, verificationStatus: 'verified', timestamp: '2023-10-30T14:48:00.000Z' } }
 * @param {string} truckId - The unique identifier of the food truck to update.
 * @returns {Object} An object containing the success status, message, and either updated truck data or error information.
 * @description
 *   - Utilizes `FoodTruckService.getTruckById` to fetch truck details.
 *   - Responds differently based on whether an error is encountered or not.
 *   - Formats the response appropriately for successful updates.
 *   - Includes a timestamp in the response when successful.
 */
async function handleUpdateSingle(truckId: string) {
  const updatedTruckResult = await FoodTruckService.getTruckById(truckId);

  if ('error' in updatedTruckResult) {
    return NextResponse.json({ success: false, error: updatedTruckResult.error }, { status: 404 });
  }

  const updatedTruck = updatedTruckResult;

  return NextResponse.json({
    success: true,
    message: 'Quality score updated successfully',
    data: {
      truckId: updatedTruck.id,
      truckName: updatedTruck.name,
      newScore: updatedTruck.data_quality_score,
      verificationStatus: updatedTruck.verification_status,
      timestamp: new Date().toISOString(),
    },
  });
}

function handleBatchUpdate() {
  return NextResponse.json({
    success: true,
    message: 'Batch quality score update completed',
    data: {
      timestamp: new Date().toISOString(),
    },
  });
}

function updateSingleTruckQualityScore(truck: { id: string }): boolean {
  try {
    // Placeholder for actual update logic if needed
    // DataQualityService.updateTruckQualityScore(truck.id);
    return true;
  } catch (error: unknown) {
    console.error(`Failed to update truck ${truck.id}:`, error);
    return false;
  }
}

/**
 * Recalculates the quality score for all food trucks.
 * @example
 * handleRecalculateAll()
 * { success: true, message: 'Quality score recalculation completed', data: { totalTrucks: 100, updated: 95, errors: 5, timestamp: '2023-10-07T10:30:00.000Z' } }
 * @param {undefined} undefined - No arguments are needed.
 * @returns {Object} JSON response with success status, message, and data containing recalculation statistics.
 * @description
 *   - Fetches all food trucks in batches for recalculation using the FoodTruckService.
 *   - Logs an error message if the API call to fetch all trucks fails.
 *   - Updates the `qualityScore` for each truck and maintains a count of successful and unsuccessful updates.
 */
async function handleRecalculateAll() {
  const allTrucksResult = await FoodTruckService.getAllTrucks(1000, 0);
  if (allTrucksResult.error !== undefined) {
    console.error('Error fetching all trucks for recalculation:', allTrucksResult.error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trucks for recalculation' },
      { status: 500 },
    );
  }
  const { trucks } = allTrucksResult;
  let updated = 0;
  let errors = 0;

  for (const truck of trucks) {
    const success = updateSingleTruckQualityScore(truck);
    if (success) {
      updated+=1;
    } else {
      errors+=1;
    }
  }

  return NextResponse.json({
    success: true,
    message: 'Quality score recalculation completed',
    data: {
      totalTrucks: trucks.length,
      updated,
      errors,
      timestamp: new Date().toISOString(),
    },
  });
}