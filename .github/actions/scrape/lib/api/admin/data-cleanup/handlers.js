import { NextResponse } from 'next/server';
import { BatchCleanupService } from '../../../../../../../lib/data-quality/batchCleanup.js';
import { DuplicatePreventionService } from '../../../../../../../lib/data-quality/duplicatePrevention.js';
/**
 * Handles different types of data cleanup requests and returns appropriate responses.
 * @example
 * handlePostRequest({ action: 'full-cleanup', options: {} })
 * returns a promise resolving to a NextResponse with cleanup result
 * @param {DataCleanupRequestBody} body - Object containing an action type and optional parameters for the cleanup process.
 * @returns {Promise<NextResponse>} Resolves to a NextResponse object indicating success or failure with details about the performed action.
 * @description
 *   - Handles specific actions: 'full-cleanup', 'check-duplicates', 'merge-duplicates', 'dry-run'.
 *   - Defaults to returning an error response for unknown actions.
 *   - Provides flexibility in defining options for each specific cleanup action.
 *   - Integrates with Next.js response mechanism for API endpoints.
 */
export async function handlePostRequest(body) {
    const { action, options = {} } = body;
    switch (action) {
        case 'full-cleanup': {
            return await handleFullCleanup(options);
        }
        case 'check-duplicates': {
            return await handleCheckDuplicates(options);
        }
        case 'merge-duplicates': {
            return await handleMergeDuplicates(options);
        }
        case 'dry-run': {
            return await handleDryRun(options);
        }
        default: {
            return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
        }
    }
}
/**
 * Processes a GET request and performs actions based on query parameters.
 * @example
 * handleGetRequest(request)
 * Promise<NextResponse>
 * @param {NextRequest} request - Incoming Next.js request object containing the URL and search parameters.
 * @returns {Promise<NextResponse>} Promise resolving to a NextResponse object.
 * @description
 *   - It extracts the `action` parameter from the request URL's query string.
 *   - Based on the action parameter value, it delegates the request to specific handlers like `handleGetStatus`, `handleGetPreview`, or `handleGetDefault`.
 *   - Handles asynchronous operations within the action cases when necessary (e.g., `preview`).
 *   - Ensures proper response handling while maintaining the server-side asynchronous flow.
 */
export async function handleGetRequest(request) {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    switch (action) {
        case 'status': {
            return handleGetStatus();
        }
        case 'preview': {
            return await handleGetPreview();
        }
        default: {
            return handleGetDefault();
        }
    }
}
/**
* Executes a full data cleanup operation based on provided options.
* @example
* handleFullCleanup({ batchSize: 100, dryRun: true, operations: ['removeDuplicates', 'optimizeData'] })
* Returns a JSON response confirming the success of the cleanup.
* @param {Object} options - Configuration for the cleanup operation.
* @returns {Promise<Object>} A JSON response with the cleanup result summary.
* @description
*   - Default batch size for cleanup is set to 50 if not specified.
*   - Supports a dry-run mode for testing cleanup without making changes.
*   - Utilizes operations parameter to specify types of cleanup tasks.
*   - Provides detailed summary in the response message.
*/
export async function handleFullCleanup(options) {
    const result = await BatchCleanupService.runFullCleanup({
        batchSize: options?.batchSize ?? 50,
        dryRun: options?.dryRun ?? false,
        operations: options?.operations,
    });
    return NextResponse.json({
        success: true,
        action: 'full-cleanup',
        result,
        message: `Cleanup completed: ${result.summary.trucksImproved} trucks improved, ${result.summary.duplicatesRemoved} duplicates removed`,
    });
}
/**
 * Handles the duplicate check functionality for truck data.
 * @example
 * handleCheckDuplicates({ options: { truckData: [...] } })
 * Returns a promise with a JSON response indicating success or failure of duplicate check.
 * @param {DataCleanupRequestBody['options']} options - The request body containing truck data to be checked.
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse object containing the result of the duplicate check.
 * @description
 *   - Utilizes the Duplicate Prevention Service to verify the presence of duplicates.
 *   - Expects `truckData` within the provided options for processing.
 *   - Returns an error JSON response with status 400 if `truckData` is not supplied.
 */
export async function handleCheckDuplicates(options) {
    const { truckData } = options ?? {};
    if (!truckData) {
        return NextResponse.json({ success: false, error: 'Missing truckData for duplicate check' }, { status: 400 });
    }
    const duplicateCheck = await DuplicatePreventionService.checkForDuplicates(truckData);
    return NextResponse.json({
        success: true,
        action: 'check-duplicates',
        result: duplicateCheck,
    });
}
/**
* Handles the merge operation for duplicate truck entries.
* @example
* handleMergeDuplicates({ targetId: '123', sourceId: '456' })
* Returns a NextResponse indicating the success or failure of the merge operation.
* @param {DataCleanupRequestBody['options']} options - Options containing targetId and sourceId for the merge operation.
* @returns {Promise<NextResponse>} Returns a NextResponse object indicating the merge result.
* @description
*   - Utilizes DuplicatePreventionService to merge duplicate entries.
*   - Sends an error response with status 400 if targetId or sourceId is missing.
*/
export async function handleMergeDuplicates(options) {
    const { targetId, sourceId } = options ?? {};
    if (targetId === undefined || sourceId === undefined) {
        return NextResponse.json({ success: false, error: 'Missing targetId or sourceId for merge operation' }, { status: 400 });
    }
    const mergedTruck = await DuplicatePreventionService.mergeDuplicates(targetId, sourceId);
    return NextResponse.json({
        success: true,
        action: 'merge-duplicates',
        result: mergedTruck,
        message: `Successfully merged truck ${sourceId} into ${targetId}`,
    });
}
/**
 * Executes a dry run of the data cleanup process without making changes to the database.
 * @example
 * handleDryRun({ operations: ['deleteUnused', 'optimizeData'] })
 * Promise resolves to NextResponse with details of the dry run.
 * @param {DataCleanupRequestBody['options']} options - Cleanup options including operations to simulate.
 * @returns {Promise<NextResponse>} A response object indicating the success of the dry run and its results.
 * @description
 *   - Utilizes the BatchCleanupService to simulate cleanup operations.
 *   - Ensures no changes are made to the database during the dry run.
 *   - Provides details of simulated operations in the response result.
 */
export async function handleDryRun(options) {
    const result = await BatchCleanupService.runFullCleanup({
        ...options,
        operations: options?.operations,
        dryRun: true,
    });
    return NextResponse.json({
        success: true,
        action: 'dry-run',
        result,
        message: 'Dry run completed - no changes made to database',
    });
}
/**
* Returns the current status with details on available operations, default batch size, and dry-run support.
* @example
* handleGetStatus()
* returns a JSON response with success status and operational details
* @returns {NextResponse} JSON response containing operation details.
* @description
*   - Lists available operations such as 'remove_placeholders', 'normalize_phone', and more.
*   - Provides default batch size set to 50.
*   - Indicates support for dry-run operations.
*/
export function handleGetStatus() {
    return NextResponse.json({
        success: true,
        status: {
            available_operations: [
                'remove_placeholders',
                'normalize_phone',
                'fix_coordinates',
                'update_quality_scores',
                'merge_duplicates',
            ],
            default_batch_size: 50,
            supports_dry_run: true,
        },
    });
}
/**
 * Generates a preview of the batch cleanup process.
 * @example
 * handleGetPreview()
 * Promise<NextResponse>
 * @returns {Promise<NextResponse>} Returns a JSON response containing the cleanup preview.
 * @description
 *   - Utilizes the BatchCleanupService to execute a dry run with a specified batch size.
 *   - Extracts summary information including estimated improvements and duplicates removed.
 *   - Structures the operations in a detailed format for review.
 */
export async function handleGetPreview() {
    const result = await BatchCleanupService.runFullCleanup({
        batchSize: 10,
        dryRun: true,
    });
    return NextResponse.json({
        success: true,
        preview: {
            estimated_improvements: result.summary.trucksImproved,
            estimated_duplicates: result.summary.duplicatesRemoved,
            operations: result.operations.map((op) => ({
                type: op.type,
                description: op.description,
                affected_count: op.affectedCount,
            })),
        },
    });
}
/**
* Provides a JSON response containing available endpoints and actions related to data cleanup.
* @example
* handleGetDefault()
* Returns a JSON response with success status, endpoints, and actions.
* @returns {NextResponse} Returns a JSON response with structure defining success, endpoints, and actions related to data cleanup.
* @description
*   - The function targets administrative cleanup operations within the system.
*   - Provides metadata for functionalities aimed at data cleanup processes.
*   - Intended to support endpoint consumption and decision-making for administrative tasks.
*/
export function handleGetDefault() {
    return NextResponse.json({
        success: true,
        endpoints: [
            'GET /api/admin/data-cleanup?action=status - Get cleanup system status',
            'GET /api/admin/data-cleanup?action=preview - Preview cleanup changes',
            'POST /api/admin/data-cleanup - Run cleanup operations',
        ],
        actions: [
            'full-cleanup - Run all cleanup operations',
            'check-duplicates - Check if truck data is duplicate',
            'merge-duplicates - Merge two duplicate trucks',
            'dry-run - Preview changes without making them',
        ],
    });
}
