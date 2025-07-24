import { NextRequest } from 'next/server';
import { type APIService } from '@/lib/monitoring/apiMonitor';
export declare function handleComprehensiveMonitoring(): any;
/**
 * Handles monitoring of API service usage based on the request parameters.
 * @example
 * handleServiceSpecificMonitoring(nextRequestInstance, apiServiceInstance)
 * { success: true, service: apiServiceInstance, usage: { requests: 50, tokens: 200 }, timestamp: "2023-10-05T14:48:00.000Z" }
 * @param {NextRequest} request - Incoming request instance containing URL and search parameters.
 * @param {APIService} service - The API service instance for which usage monitoring is being handled.
 * @returns {NextResponse} JSON response containing the service usage and possibility of making requests.
 * @description
 *   - Parses URL search parameters to extract action type and usage metrics.
 *   - Calls `APIMonitor.canMakeRequest` to determine if the request can be made when action is 'check'.
 *   - Returns current usage statistics when action is not 'check'.
 */
export declare function handleServiceSpecificMonitoring(request: NextRequest, service: APIService): Promise<any>;
export declare function handleClearAlerts(): any;
export declare function handleGetAlerts(): any;
/**
 * Handles test alert triggering based on service and level provided.
 * @example
 * handleTestAlert({service: 'database', level: 'high'})
 * // Expected response in JSON format with success message.
 * @param {Object} body - The object containing service and level details.
 * @param {string} body.service - The name of the service for which the alert is triggered.
 * @param {string} body.level - The severity level of the alert.
 * @returns {Object} JSON response indicating success or failure status.
 * @description
 *   - Returns a success message with service and level if both are provided.
 *   - Responds with an error message if either service or level is missing.
 *   - Simulates alert triggering functionality - no real alert system interaction.
 */
export declare function handleTestAlert(body: {
    service: string;
    level: string;
}): any;
