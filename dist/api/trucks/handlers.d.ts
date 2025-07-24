export declare function handleGetTruckById(id: string): Promise<any>;
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
export declare function handleGetTrucksByLocation(lat: string, lng: string, radius: string): Promise<any>;
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
export declare function handleGetAllTrucks(limit: number, offset: number): Promise<any>;
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
export declare function handlePostTruck(truckData: unknown): Promise<any>;
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
export declare function handlePutTruck(id: string, updates: unknown): Promise<any>;
