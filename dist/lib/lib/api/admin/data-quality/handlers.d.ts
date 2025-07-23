import { NextRequest, NextResponse } from 'next/server';
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
export declare function handleGetRequest(request: NextRequest): Promise<NextResponse>;
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
export declare function handlePostRequest(request: NextRequest): Promise<NextResponse>;
