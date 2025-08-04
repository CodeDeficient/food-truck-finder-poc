import { NextResponse } from 'next/server';
import { supabase } from '../../supabase/client.js';
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
export async function handleGetRequest(_request) {
    const status = await getOAuthStatus();
    return NextResponse.json({
        success: true,
        ...status,
        legacy_format: {
            oauth_status: status.overall_status,
            message: getStatusMessage(status.overall_status),
            configuration_steps: status.overall_status === 'ready'
                ? undefined
                : [
                    '1. Go to Supabase Dashboard > Authentication > Providers',
                    '2. Enable Google provider',
                    '3. Add Google OAuth Client ID and Secret',
                    '4. Configure redirect URLs',
                    '5. Test OAuth flow',
                ],
        },
    });
}
// 1. Refactor nested template literals in generateOAuthTestUrl
function generateOAuthTestUrl(baseUrl) {
    const redirectPath = `${baseUrl}/auth/callback`;
    const encodedRedirect = encodeURIComponent(redirectPath);
    return (process.env.NEXT_PUBLIC_SUPABASE_URL +
        '/auth/v1/authorize?provider=google&redirect_to=' +
        encodedRedirect);
}
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
export function handlePostRequest() {
    // Removed _request parameter
    const baseUrl = process.env.NODE_ENV === 'production'
        ? 'https://food-truck-finder-poc-git-feat-s-20ec1c-codedeficients-projects.vercel.app'
        : 'http://localhost:3000';
    const testUrl = generateOAuthTestUrl(baseUrl);
    return NextResponse.json({
        success: true,
        message: 'OAuth test URL generated',
        test_url: testUrl,
        environment: process.env.NODE_ENV ?? 'development',
        instructions: [
            '1. Open the test_url in a new browser tab',
            '2. Complete Google OAuth flow',
            '3. Verify redirect to admin dashboard',
            '4. Check for proper role assignment',
        ],
        manual_test_steps: [
            'Navigate to /login page',
            'Click Google login button',
            'Complete OAuth flow',
            'Verify admin access',
        ],
        automation_commands: [
            'npm run oauth:verify - Check configuration',
            'npm run oauth:test:dev - Test development flow',
            'npm run oauth:test:prod - Test production flow',
        ],
    });
}
/**
 * Retrieves the current OAuth status including configuration and connectivity information.
 * @example
 * getOAuthStatus().then(status => {
 *   console.log(status);
 * });
 * // Output: OAuthStatus object with current configuration and connection status details
 * @returns {Promise<OAuthStatus>} An object representing the current status of OAuth configuration and connectivity.
 * @description
 *   - The function assesses the connectivity and configuration of Supabase and its authentication settings.
 *   - It checks if the necessary environment variables are set.
 *   - Executes a series of asynchronous checks to determine if the OAuth provider is properly configured.
 *   - Recommendations for improving the OAuth setup are generated based on the current status.
 */
async function getOAuthStatus() {
    const status = {
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
        supabase: {
            connected: false,
            projectId: 'zkwliyjjkdnigizidlln',
        },
        environment_variables: {
            supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined,
            supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== undefined,
            supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY !== undefined,
        },
        oauth_flow: {
            loginPageExists: true,
            callbackRouteExists: true,
            authProviderConfigured: false,
        },
        recommendations: [],
        overall_status: 'not_configured',
    };
    await checkSupabaseConnection(status, supabase);
    await checkSupabaseAuthSettings(status);
    await testOAuthProvider(status, supabase);
    status.recommendations = generateRecommendations(status);
    status.overall_status = determineOverallStatus(status);
    return status;
}
/**
 * Checks the connection status with Supabase and updates the `OAuthStatus`.
 * @example
 * checkSupabaseConnection(status, supabase)
 * // Updates the `status.supabase.connected` property based on connection success
 * @param {OAuthStatus} status - The current OAuthStatus object that tracks connection state and errors.
 * @param {SupabaseClient} supabase - The Supabase client instance used to interact with the database.
 * @returns {void} No explicit return value, operates directly on the `status` object.
 * @description
 *   - Attempts a query to the 'profiles' table to ensure Supabase connection.
 *   - Updates `status.supabase.connected` based on query success.
 *   - Captures and records detailed error messages in case of connection failure.
 */
async function checkSupabaseConnection(status, supabase) {
    try {
        const { error } = await supabase.from('profiles').select('count').limit(1);
        if (error === null) {
            status.supabase.connected = true;
        }
        else {
            status.supabase.error = error.message;
        }
    }
    catch (error) {
        status.supabase.error = error instanceof Error ? error.message : 'Unknown connection error';
    }
}
/**
 * Checks and processes Supabase authentication settings.
 * @example
 * checkSupabaseAuthSettings(oAuthStatusInstance)
 * { supabase: { authSettings: { googleEnabled: true, signupEnabled: false, autoconfirm: true } } }
 * @param {OAuthStatus} status - An object that holds OAuth configuration status.
 * @returns {void} Modifies the passed status object with fetched authentication settings.
 * @description
 *   - The function fetches authentication settings from the Supabase URL defined in environment variables.
 *   - If Supabase settings are fetched successfully, it updates the OAuth status with authentication settings like Google integration, signup availability, and autoconfirm feature.
 *   - Provides a fallback log for cases where fetching settings require authentication.
 */
async function checkSupabaseAuthSettings(status) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (typeof supabaseUrl === 'string' && supabaseUrl.length > 0) {
            // Explicit check for undefined and empty string
            const settingsResponse = await fetch(`${supabaseUrl}/auth/v1/settings`);
            if (settingsResponse.ok === true) {
                const settings = (await settingsResponse.json());
                status.supabase.authSettings = {
                    googleEnabled: settings.external?.google ?? false,
                    signupEnabled: settings.disable_signup === false,
                    autoconfirm: settings.autoconfirm ?? false,
                };
                if (settings.external?.google !== undefined) {
                    // Explicit check for undefined
                    status.oauth_flow.authProviderConfigured = true;
                }
            }
        }
    }
    catch {
        console.info('Auth settings endpoint requires authentication (normal)');
    }
}
/**
 * Tests the configuration of an OAuth provider and updates the status based on the result.
 * @example
 * testOAuthProvider(status, supabase)
 * undefined
 * @param {OAuthStatus} status - An object representing the current OAuth status and configuration.
 * @param {SupabaseClient} supabase - The Supabase client instance used to interact with the authentication system.
 * @returns {void} Does not return any value.
 * @description
 *   - Utilizes Google as the OAuth provider for the sign-in attempt.
 *   - Redirects to a localhost callback URL to simulate the OAuth process.
 *   - Direct usage of the Supabase auth method to initiate OAuth process.
 *   - Handles exceptions without altering the control flow and logs them for informational purposes.
 */
async function testOAuthProvider(status, supabase) {
    try {
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: 'http://localhost:3000/auth/callback',
                skipBrowserRedirect: true,
            },
        });
        if (oauthError !== null && oauthError.message !== 'Provider not found') {
            // Explicitly check for oauthError existence
            status.oauth_flow.authProviderConfigured = true;
        }
    }
    catch (error) {
        console.info('OAuth provider test failed (may be normal):', error);
    }
}
/**
 * Generates a list of recommendations for OAuth configuration based on the current status.
 * @example
 * generateRecommendations(status)
 * ['❌ Configure NEXT_PUBLIC_SUPABASE_URL environment variable', ...]
 * @param {OAuthStatus} status - The current status of OAuth configuration and environment variables.
 * @returns {string[]} Array of recommendation messages to guide configuration setup.
 * @description
 *   - Checks for necessary environment variables and Supabase connectivity.
 *   - Provides guidance on enabling Google OAuth.
 *   - Suggests consulting documentation for further setup instructions.
 */
function generateRecommendations(status) {
    const recommendations = [];
    if (!status.environment_variables.supabaseUrl) {
        recommendations.push('❌ Configure NEXT_PUBLIC_SUPABASE_URL environment variable');
    }
    if (!status.environment_variables.supabaseAnonKey) {
        recommendations.push('❌ Configure NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
    }
    if (!status.environment_variables.supabaseServiceKey) {
        recommendations.push('❌ Configure SUPABASE_SERVICE_ROLE_KEY environment variable');
    }
    if (!status.supabase.connected) {
        recommendations.push('❌ Fix Supabase connection issue');
        if (typeof status.supabase.error === 'string' && status.supabase.error.length > 0) {
            recommendations.push(`   Error: ${status.supabase.error}`);
        }
    }
    if (status.supabase.authSettings?.googleEnabled === true) {
        recommendations.push('✅ Google OAuth provider is enabled');
    }
    else {
        recommendations.push('🔧 Enable Google OAuth provider in Supabase Dashboard', '   Go to: Authentication > Providers > Google');
    }
    if (status.overall_status === 'ready') {
        recommendations.push('🎉 OAuth configuration is complete!', '✅ Test the login flow at /login');
    }
    if (recommendations.length > 1) {
        recommendations.push('📖 See docs/GOOGLE_OAUTH_SETUP_GUIDE.md for detailed instructions', '🔧 Run: npm run oauth:verify for automated checks');
    }
    return recommendations;
}
/**
 * Determines the overall OAuth status based on provided conditions.
 * @example
 * determineOverallStatus(status)
 * 'ready'
 * @param {OAuthStatus} status - The status object containing configuration details.
 * @returns {'ready' | 'partial' | 'not_configured' | 'error'} Overall status derived from the evaluations.
 * @description
 *   - Evaluates connectivity and configuration status from various parameters within the status object.
 *   - Prioritizes returning 'error' if Supabase connection fails or if an error is detected.
 *   - Checks completeness of environment variables before proceeding to other status evaluations.
 *   - Distinguishes between 'ready' and 'partial' based on specific OAuth settings.
 */
function determineOverallStatus(status) {
    // eslint-disable-next-line sonarjs/different-types-comparison
    if (!status.supabase.connected || status.supabase.error !== null) {
        return 'error';
    }
    const envVarsComplete = Object.values(status.environment_variables).every(Boolean);
    if (!envVarsComplete) {
        return 'not_configured';
    }
    if (status.supabase.authSettings?.googleEnabled && status.oauth_flow.authProviderConfigured) {
        return 'ready';
    }
    if (status.supabase.connected && envVarsComplete) {
        return 'partial';
    }
    return 'not_configured';
}
/**
 * Retrieves a human-readable message based on the OAuth configuration status.
 * @example
 * getStatusMessage('ready')
 * 'Google OAuth is fully configured and ready to use'
 * @param {string} status - The current status of the OAuth configuration.
 * @returns {string} A message explaining the OAuth configuration status.
 * @description
 *   - Handles several predefined status cases.
 *   - Provides feedback for both success and error states.
 *   - Returns a default message for unrecognized statuses.
 */
function getStatusMessage(status) {
    switch (status) {
        case 'ready': {
            return 'Google OAuth is fully configured and ready to use';
        }
        case 'partial': {
            return 'Basic configuration complete, OAuth provider needs setup';
        }
        case 'not_configured': {
            return 'Google OAuth is not configured';
        }
        case 'error': {
            return 'Configuration error detected';
        }
        default: {
            return 'Unknown configuration status';
        }
    }
}
