import { NextResponse } from 'next/server';
import { FoodTruckService } from '@/lib/supabase';

export async function handleGetTruckById(id: string) {
  const truckResult = await FoodTruckService.getTruckById(id);
  if ('error' in truckResult) {
    return NextResponse.json({ error: truckResult.error }, { status: 500 });
  }
  return NextResponse.json({ truck: truckResult });
}

/**
 * Retrieves a list of food trucks within a specified radius.
 * @example
 * handleGetTrucksByLocation("37.7749", "-122.4194", "5")
 * Returns an object with the list of nearby food trucks and additional metadata.
 * @param {string} lat - Latitude of the location from which to search for food trucks.
 * @param {string} lng - Longitude of the location from which to search for food trucks.
 * @param {string} radius - The radius (in kilometers) within which to find food trucks.
 * @returns {Object} An object containing a list of nearby food trucks along with metadata related to the query.
 * @description
 *   - Converts latitude, longitude, and radius from string to float.
 *   - Invokes an asynchronous service call to fetch trucks.
 *   - Returns an error message with status 500 if an error is encountered.
 *   - Currently, assumes no pagination is needed for location-based searches.
 */
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

/**
 * Retrieves truck data with pagination support.
 * @example
 * handleGetAllTrucks(10, 0)
 * { trucks: [...], total: 100, limit: 10, offset: 0, hasMore: true, summary: {...} }
 * @param {number} limit - Number of trucks to retrieve per request.
 * @param {number} offset - Starting position of truck data to retrieve.
 * @returns {object} JSON response containing truck data, pagination information, and summary.
 * @description
 *   - Checks for errors returned by the FoodTruckService API and responds with a generic error message.
 *   - Computes an `averageQuality` score for the retrieved trucks.
 *   - Determines `hasMore` by comparing total trucks to limit and offset.
 *   - Calculates `lastUpdated` timestamp from truck data.
 */
export async function handleGetAllTrucks(limit: number, offset: number) {
  const { trucks, total, error } = await FoodTruckService.getAllTrucks(limit, offset) ?? {};
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

/**
* Handles the creation of a food truck by delegating to the FoodTruckService.
* @example
* handlePostTruck({ name: 'Best Food Truck', location: 'Downtown' })
* // returns a JSON response with status 201 and a success message
* @param {unknown} truckData - Data for creating a new food truck.
* @returns {object} JSON response indicating success or failure.
* @description
*   - Utilizes FoodTruckService to create a new truck record.
*   - Handles errors, logging them and returning appropriate HTTP statuses.
*   - Converts the data into a Partial<FoodTruck> type before passing it to the service.
*/
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

/**
 * Updates food truck information with given updates and returns the operation status.
 * @example
 * handlePutTruck('1234', { name: 'New Food Truck Name' })
 * { message: 'Food truck updated successfully', truck: updatedTruckResult }
 * @param {string} id - The ID of the food truck to be updated.
 * @param {unknown} updates - The updates to apply to the food truck as a partial object.
 * @returns {Promise<NextResponse>} A response indicating success or failure of the update operation in JSON format.
 * @description
 *   - The function uses FoodTruckService.updateTruck to apply updates.
 *   - It logs errors to the console if the update operation fails.
 *   - Responds with HTTP status 500 in case of any error during the update process.
 */
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
