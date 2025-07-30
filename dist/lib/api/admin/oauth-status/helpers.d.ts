import { NextRequest, NextResponse } from 'next/server';
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
export declare function handleGetRequest(_request: NextRequest): Promise<NextResponse<{
    legacy_format: {
        oauth_status: "error" | "ready" | "partial" | "not_configured";
        message: string;
        configuration_steps: string[] | undefined;
    };
    timestamp: string;
    environment: "development" | "production";
    supabase: {
        connected: boolean;
        projectId: string;
        authSettings?: {
            googleEnabled: boolean;
            signupEnabled: boolean;
            autoconfirm: boolean;
        };
        error?: string;
    };
    environment_variables: {
        supabaseUrl: boolean;
        supabaseAnonKey: boolean;
        supabaseServiceKey: boolean;
    };
    oauth_flow: {
        loginPageExists: boolean;
        callbackRouteExists: boolean;
        authProviderConfigured: boolean;
    };
    recommendations: string[];
    overall_status: "ready" | "partial" | "not_configured" | "error";
    success: boolean;
}>>;
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
export declare function handlePostRequest(): NextResponse<{
    success: boolean;
    message: string;
    test_url: string;
    environment: string;
    instructions: string[];
    manual_test_steps: string[];
    automation_commands: string[];
}>;
