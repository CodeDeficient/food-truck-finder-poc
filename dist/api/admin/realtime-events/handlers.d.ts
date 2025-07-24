import { NextRequest } from 'next/server';
/**
* Handles incoming GET requests by streaming real-time admin events through Server-Sent Events.
* @example
* handleGetRequest(request)
* Response object with event stream data
* @param {NextRequest} request - Incoming request to handle and process.
* @returns {Response} Returns a streaming Response object containing the SSE data.
* @description
*   - Initializes a readable stream for emitting real-time events as SSE.
*   - Enqueues a connection event upon a new client connection.
*   - Sets up periodic heartbeat events every 5 seconds.
*   - Registers an abort event listener to gracefully close streams and clear intervals.
*/
export declare function handleGetRequest(request: NextRequest): Response;
/**
 * Handles a POST request and performs an action based on the 'action' property in the request body.
 * @example
 * handlePostRequest(request)
 * Promise<Response>
 * @param {NextRequest} request - The incoming request object containing the POST data.
 * @returns {Promise<Response>} A response object indicating the result of the action.
 * @description
 *   - Utilizes type guarding to validate the presence of the 'action' property in the request body.
 *   - Executes different actions like 'health_check' or 'trigger_test_event' based on the 'action' value.
 *   - Provides error handling to return appropriate response codes and error messages.
 */
export declare function handlePostRequest(request: NextRequest): Promise<Response>;
