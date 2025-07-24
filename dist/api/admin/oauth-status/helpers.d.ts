import { NextRequest } from 'next/server';
/**
 * Handles a GET request to retrieve OAuth configuration status.
 * @example
 * handleGetRequest(request)
 * Returns a JSON response with OAuth status details and legacy format.
 * @param {NextRequest} _request - The incoming request object.
 * @returns {NextResponse} JSON response indicating the current OAuth status.
 * @description
 *   - Retrieves the current OAuth configuration status from the server.
 *   - Adapts the response to include both modern and legacy format details.
 *   - Provides a step-by-step legacy configuration guide if OAuth is not ready.
 */
export declare function handleGetRequest(_request: NextRequest): Promise<any>;
/**
 * Handles a post request to generate an OAuth test URL based on the environment.
 * @example
 * handlePostRequest()
 * {
 *   success: true,
 *   message: 'OAuth test URL generated',
 *   test_url: 'http://localhost:3000/...',
 *   environment: 'development',
 *   instructions: [ ... ],
 *   manual_test_steps: [ ... ],
 *   automation_commands: [ ... ]
 * }
 * @returns {object} An object containing success status, message, the test URL, the environment, instructions, manual test steps, and automation commands.
 * @description
 *   - Determines the base URL depending on whether the environment is production or development.
 *   - Utilizes `generateOAuthTestUrl` to construct the OAuth test URL.
 *   - Responds with JSON containing test instructions and automation commands for verifying OAuth functionality.
 */
export declare function handlePostRequest(): any;
