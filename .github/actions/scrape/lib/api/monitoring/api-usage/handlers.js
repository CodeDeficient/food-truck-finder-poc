import { NextResponse } from 'next/server';
import { APIMonitor } from '../../../../../../../lib/monitoring/apiMonitor.js';
export function handleComprehensiveMonitoring() {
    const monitoringResult = APIMonitor.checkAllAPIs();
    return NextResponse.json({
        success: true,
        data: monitoringResult,
        timestamp: new Date().toISOString(),
    });
}
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
export async function handleServiceSpecificMonitoring(request, service) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    if (action === 'check') {
        const requestCount = Number.parseInt(searchParams.get('requests') ?? '1', 10);
        const tokenCount = Number.parseInt(searchParams.get('tokens') ?? '0', 10);
        const canMakeRequest = await APIMonitor.canMakeRequest(service, requestCount, tokenCount);
        const usage = APIMonitor.getCurrentUsage(service);
        return NextResponse.json({
            success: true,
            service,
            canMakeRequest: canMakeRequest.allowed,
            reason: canMakeRequest.reason,
            waitTime: canMakeRequest.waitTime,
            usage,
            timestamp: new Date().toISOString(),
        });
    }
    const usage = APIMonitor.getCurrentUsage(service);
    return NextResponse.json({
        success: true,
        service,
        usage,
        timestamp: new Date().toISOString(),
    });
}
export function handleClearAlerts() {
    APIMonitor.clearAlertHistory();
    return NextResponse.json({
        success: true,
        message: 'Alert history cleared',
    });
}
export function handleGetAlerts() {
    const alerts = APIMonitor.getAlertHistory();
    return NextResponse.json({
        success: true,
        alerts,
        count: alerts.length,
    });
}
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
export function handleTestAlert(body) {
    const { service, level } = body;
    if (service == undefined || level == undefined) {
        return NextResponse.json({ success: false, error: 'Missing service or level' }, { status: 400 });
    }
    // This would trigger a test alert in a real implementation
    return NextResponse.json({
        success: true,
        message: `Test alert triggered for ${service} at ${level} level`,
    });
}
