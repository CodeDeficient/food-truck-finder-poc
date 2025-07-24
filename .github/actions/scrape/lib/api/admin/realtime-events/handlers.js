import { ScrapingJobService, FoodTruckService, } from '../../../../../../../lib/supabase.js';
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
export function handleGetRequest(request) {
    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();
            const connectionEvent = {
                id: generateEventId(),
                type: 'heartbeat',
                timestamp: new Date().toISOString(),
                data: {
                    message: 'Real-time admin dashboard connected',
                    connectionId: generateEventId(),
                },
            };
            controller.enqueue(encoder.encode(formatSSEMessage(connectionEvent)));
            const intervalId = setInterval(async () => {
                await sendHeartbeatEvent(controller, encoder);
            }, 5000);
            const changeMonitorId = setupDataChangeMonitor(controller, encoder);
            request.signal.addEventListener('abort', () => {
                clearInterval(intervalId);
                clearInterval(changeMonitorId);
                controller.close();
            });
        },
    });
    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control',
        },
    });
}
/**
* Sends a heartbeat event by fetching realtime metrics or logs an error alert when unsuccessful
* @example
* sendHeartbeatEvent(controller, encoder)
* // No return value
* @param {ReadableStreamDefaultController<Uint8Array>} controller - The controller used for enqueueing the event data.
* @param {TextEncoder} encoder - The encoder used to convert the event data to a Uint8Array.
* @returns {Promise<void>} Promise that resolves when event has been sent or error has been handled.
* @description
*   - Utilizes `fetchRealtimeMetrics()` to gather current system metrics.
*   - Generates a unique event id via `generateEventId()`.
*   - Formats the event data using `formatSSEMessage()` before enqueueing.
*   - Handles errors by creating a system alert event if metrics fetching fails.
*/
async function sendHeartbeatEvent(controller, encoder) {
    try {
        const metrics = await fetchRealtimeMetrics();
        const event = {
            id: generateEventId(),
            type: 'heartbeat',
            timestamp: new Date().toISOString(),
            data: { ...metrics },
        };
        controller.enqueue(encoder.encode(formatSSEMessage(event)));
    }
    catch (error) {
        console.error('Error fetching realtime metrics:', error);
        const errorEvent = {
            id: generateEventId(),
            type: 'system_alert',
            timestamp: new Date().toISOString(),
            data: {
                error: 'Failed to fetch metrics',
                details: error instanceof Error ? error.message : 'Unknown error',
            },
            severity: 'error',
        };
        controller.enqueue(encoder.encode(formatSSEMessage(errorEvent)));
    }
}
/**
* Sets up a periodic monitor for data changes using provided controller and encoder.
* @example
* setupDataChangeMonitor(controller, encoder)
* // returns a NodeJS.Timeout object that repeatedly monitors data changes every 10 seconds
* @param {ReadableStreamDefaultController<Uint8Array>} controller - Controller to handle readable stream of Uint8Array.
* @param {TextEncoder} encoder - Encoder to encode texts for processing the monitor.
* @returns {NodeJS.Timeout} Returns a timeout object responsible for invoking data change monitoring at set intervals.
* @description
*   - Utilizes async operation to monitor data changes ensuring non-blocking execution.
*   - Handles errors by logging them to the console, useful for debugging.
*/
function setupDataChangeMonitor(controller, encoder) {
    return setInterval(async () => {
        try {
            await monitorDataChanges(controller, encoder);
        }
        catch (error) {
            console.error('Error monitoring data changes:', error);
        }
    }, 10_000);
}
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
export async function handlePostRequest(request) {
    try {
        const rawBody = await request.json();
        const isPostRequestBody = (obj) => {
            return (typeof obj === 'object' &&
                obj !== null &&
                'action' in obj &&
                typeof obj.action === 'string' &&
                (obj.action === 'health_check' ||
                    obj.action === 'trigger_test_event'));
        };
        if (!isPostRequestBody(rawBody)) {
            return new Response(JSON.stringify({
                success: false,
                error: "Invalid request body: 'action' property is missing or not a valid action.",
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }
        const body = rawBody;
        switch (body.action) {
            case 'health_check': {
                return await handleHealthCheck();
            }
            case 'trigger_test_event': {
                return handleTriggerTestEvent();
            }
            default: {
                return new Response(JSON.stringify({
                    success: false,
                    error: "That didn't work, please try again later.",
                }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }
        }
    }
    catch (error) {
        console.error('Realtime events POST error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: "That didn't work, please try again later.",
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
/**
 * Fetches current scraping job metrics, data quality statistics, and system health status.
 * @example
 * fetchRealtimeMetrics()
 * {
 *   scrapingJobs: { active: 4, completed: 5, failed: 1, pending: 2 },
 *   dataQuality: { averageScore: 85, totalTrucks: 50, recentChanges: 0 },
 *   systemHealth: { status: 'healthy', uptime: 3600, lastUpdate: '2023-10-01T12:00:00Z' }
 * }
 * @returns {Promise<RealtimeMetrics>} An object containing metrics about scraping jobs, data quality, and system health.
 * @description
 *   - Utilizes external services ScrapingJobService and FoodTruckService to gather data.
 *   - Provides comprehensive metrics for monitoring system health and data processing status.
 *   - Catches errors to ensure consistent return structure even upon failure.
 */
async function fetchRealtimeMetrics() {
    try {
        const recentJobs = await ScrapingJobService.getJobsByStatus('all');
        const scrapingMetrics = {
            active: recentJobs.filter((job) => job.status === 'running').length,
            completed: recentJobs.filter((job) => job.status === 'completed').length,
            failed: recentJobs.filter((job) => job.status === 'failed').length,
            pending: recentJobs.filter((job) => job.status === 'pending').length,
        };
        const qualityStats = await FoodTruckService.getDataQualityStats();
        const dataQualityMetrics = {
            averageScore: qualityStats.avg_quality_score ?? 0,
            totalTrucks: qualityStats.total_trucks ?? 0,
            recentChanges: 0,
        };
        const systemHealth = {
            status: 'healthy',
            uptime: process.uptime(),
            lastUpdate: new Date().toISOString(),
        };
        return {
            scrapingJobs: scrapingMetrics,
            dataQuality: dataQualityMetrics,
            systemHealth,
        };
    }
    catch (error) {
        console.error('Error fetching realtime metrics:', error);
        return {
            scrapingJobs: { active: 0, completed: 0, failed: 0, pending: 0 },
            dataQuality: { averageScore: 0, totalTrucks: 0, recentChanges: 0 },
            systemHealth: {
                status: 'error',
                uptime: 0,
                lastUpdate: new Date().toISOString(),
            },
        };
    }
}
function isScrapingJob(obj) {
    return typeof obj === 'object' && obj !== null && 'id' in obj && 'status' in obj;
}
// Removed isFoodTruck function as it is unused.
// function isFoodTruck(obj: unknown): obj is FoodTruck {
//   return typeof obj === 'object' && obj !== null && 'id' in obj && 'name' in obj;
// }
/**
 * Sends an update event about recent scraping jobs to a stream.
 * @example
 * sendScrapingUpdateEvent(controller, encoder)
 * @param {ReadableStreamDefaultController<Uint8Array>} controller - The stream controller to enqueue the event data.
 * @param {TextEncoder} encoder - The TextEncoder used to encode the event message.
 * @returns {Promise<void>} Resolves when the event has been enqueued.
 * @description
 *   - The function retrieves all recent scraping jobs with their status.
 *   - Filters the jobs to include only valid scraping jobs.
 *   - Constructs an event object adhering to the expected format.
 *   - Uses the controller to stream the encoded event to the client.
 */
async function sendScrapingUpdateEvent(controller, encoder) {
    const recentJobs = await ScrapingJobService.getJobsByStatus('all');
    if (Array.isArray(recentJobs) && recentJobs.length > 0) {
        const event = {
            id: generateEventId(),
            type: 'scraping_update',
            timestamp: new Date().toISOString(),
            data: {
                recentJobs: recentJobs
                    .filter((job) => isScrapingJob(job))
                    .map((job) => ({
                    // Fixed unicorn/no-array-callback-reference
                    id: job.id,
                    status: job.status,
                    started_at: job.started_at,
                    completed_at: job.completed_at,
                })),
                count: recentJobs.length,
            },
            severity: 'info',
        };
        controller.enqueue(encoder.encode(formatSSEMessage(event)));
    }
}
/**
 * Sends a data quality change event if recent updates are detected.
 * @example
 * sendDataQualityChangeEvent(controller, encoder)
 * // Enqueues an event to the provided controller.
 * @param {ReadableStreamDefaultController<Uint8Array>} controller - The controller that enqueues the encoded event data.
 * @param {TextEncoder} encoder - The encoder used to transform event data into Uint8Array format.
 * @returns {Promise<void>} Resolves when the event is successfully handled and enqueued.
 * @description
 *   - Retrieves recent food truck updates from the FoodTruckService.
 *   - Filters food trucks updated within the last minute.
 *   - Formats a server-sent event message with the updates.
 *   - Only enqueues the event if there are updates detected.
 */
async function sendDataQualityChangeEvent(controller, encoder) {
    const recentTrucksResult = await FoodTruckService.getAllTrucks(10, 0);
    const recentlyUpdated = recentTrucksResult.trucks.filter((truck) => {
        if (!truck.updated_at)
            return false;
        const updatedAt = new Date(truck.updated_at);
        const oneMinuteAgo = new Date(Date.now() - 60_000);
        return updatedAt > oneMinuteAgo;
    });
    if (recentlyUpdated.length > 0) {
        const event = {
            id: generateEventId(),
            type: 'data_quality_change',
            timestamp: new Date().toISOString(),
            data: {
                updatedTrucks: recentlyUpdated.map((truck) => ({
                    id: truck.id,
                    name: truck.name,
                    data_quality_score: truck.data_quality_score,
                    updated_at: truck.updated_at,
                })),
                count: recentlyUpdated.length,
            },
            severity: 'info',
        };
        controller.enqueue(encoder.encode(formatSSEMessage(event)));
    }
}
async function monitorDataChanges(controller, encoder) {
    try {
        await sendScrapingUpdateEvent(controller, encoder);
        await sendDataQualityChangeEvent(controller, encoder);
    }
    catch (error) {
        console.error('Error monitoring data changes:', error);
    }
}
function formatSSEMessage(event) {
    return `id: ${event.id}\nevent: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}
function generateEventId() {
    // eslint-disable-next-line sonarjs/pseudo-random -- Math.random is acceptable for generating non-security-sensitive event IDs.
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
/**
 * Performs a health check and returns the system status along with real-time metrics.
 * @example
 * handleHealthCheck().then(response => console.log(response));
 * Response { "success": true, "status": "healthy", "metrics": {...}, "timestamp": "2023-03-17T12:34:56.789Z" }
 * @returns {Promise<Response>} A Promise that resolves to a Response object containing JSON data.
 * @description
 *   - Utilizes real-time metrics to provide current system health information.
 *   - Returns a JSON response formatted with specific headers and structure.
 */
async function handleHealthCheck() {
    const metrics = await fetchRealtimeMetrics();
    return new Response(JSON.stringify({
        success: true,
        status: 'healthy',
        metrics,
        timestamp: new Date().toISOString(),
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
}
/**
 * Returns a JSON response indicating a test event has been triggered.
 * @example
 * handleTriggerTestEvent()
 * Response object with a success message.
 * @returns {Response} JSON response containing success status, message, and timestamp.
 * @description
 *   - The response content type is set to 'application/json'.
 *   - The timestamp is generated using the current date and time.
 *   - Ensures consistent response formatting for realtime event triggers.
 */
function handleTriggerTestEvent() {
    return new Response(JSON.stringify({
        success: true,
        message: 'Test event triggered',
        timestamp: new Date().toISOString(),
    }), {
        headers: { 'Content-Type': 'application/json' },
    });
}
