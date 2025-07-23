/**
 * SOTA Batch Data Cleanup System
 * Implements automated data quality improvements and cleanup operations
 */
export interface CleanupOperation {
    type: 'normalize_phone' | 'fix_coordinates' | 'remove_placeholders' | 'update_quality_scores' | 'merge_duplicates';
    description: string;
    affectedCount: number;
    successCount: number;
    errorCount: number;
    errors: string[];
}
export interface BatchCleanupResult {
    totalProcessed: number;
    operations: CleanupOperation[];
    summary: {
        trucksImproved: number;
        duplicatesRemoved: number;
        qualityScoreImprovement: number;
        placeholdersRemoved: number;
    };
    duration: number;
}
/**
 * Automated Data Quality Cleanup Service
 */
export declare class BatchCleanupService {
    /**
     * Run comprehensive data cleanup operations
     */
    static runFullCleanup(options?: {
        batchSize?: number;
        dryRun?: boolean;
        operations?: CleanupOperation['type'][];
    }): Promise<BatchCleanupResult>;
    /**
    * Initializes and returns a new BatchCleanupResult object with default values.
    * @example
    * initializeCleanupResult()
    * { totalProcessed: 0, operations: [], summary: { trucksImproved: 0, duplicatesRemoved: 0, qualityScoreImprovement: 0, placeholdersRemoved: 0 }, duration: 0 }
    * @returns {BatchCleanupResult} A new BatchCleanupResult object with all properties set to initial default values.
    */
    private static initializeCleanupResult;
    private static finalizeCleanupResult;
    /**
     * Processes food trucks in batches, executing specified operations on each batch.
     * @example
     * processTrucksInBatches(truckList, { batchSize: 10, operations: ['clean'], dryRun: true, result: batchResult })
     * // It executes 'clean' operation on batches of 10 trucks without making permanent changes.
     * @param {FoodTruck[]} trucks - Array of food trucks to be processed in batches.
     * @param {object} options - Options object containing batchSize, operations, dryRun, and result.
     * @param {number} options.batchSize - Number of trucks in each batch.
     * @param {CleanupOperation['type'][]} options.operations - Array of operation types to be executed on each batch.
     * @param {boolean} options.dryRun - If true, operations are executed in simulation mode without permanent changes.
     * @param {BatchCleanupResult} options.result - Stores the results of operations performed on batches.
     * @returns {Promise<void>} Completes processing batches without a return value.
     * @description
     *   - Uses async function to allow non-blocking execution of operations.
     *   - Collects and stores results of batch operations separately, keeping track of each operation's outcome.
     *   - Iterates over arrays using slicing to dynamically create batches for processing.
     */
    private static processTrucksInBatches;
    /**
     * Run a specific cleanup operation
     */
    private static runOperation;
    private static runRemovePlaceholders;
    private static runNormalizePhoneNumbers;
    private static runFixCoordinates;
    private static runUpdateQualityScores;
    private static runMergeDuplicates;
    /**
     * Remove placeholder and mock data
     */
    private static removePlaceholders;
    private static processSingleTruckForPlaceholders;
    /**
     * Perform an update operation on a specified food truck.
     * @example
     * performUpdateOperation('truck123', { name: 'New Name' }, true, cleanupOperation)
     * // No direct return value; operation may log errors.
     * @param {string} truckId - The unique identifier of the food truck to be updated.
     * @param {Partial<FoodTruck>} updates - An object containing the fields to be updated.
     * @param {boolean} dryRun - Flag indicating whether the operation should be a simulation without actual changes.
     * @param {CleanupOperation} operation - An operation object that logs errors encountered during update.
     * @returns {Promise<void>} A promise that resolves when the update operation is complete.
     * @description
     *   - If 'dryRun' is true, no updates are applied but actions are logged.
     *   - Errors during update are caught and logged in the 'operation.errors' array.
     */
    private static performUpdateOperation;
    /**
     * Normalize phone numbers to consistent format
     */
    private static normalizePhoneNumbers;
    /**
     * Apply phone normalization update to a food truck's contact information.
     * @example
     * applyPhoneNormalizationUpdate(truckInstance, '+1234567890', false, operationInstance)
     * // Normalizes and updates phone number of given truckInstance.
     * @param {FoodTruck} truck - The food truck object whose phone number needs normalization.
     * @param {string} normalizedPhone - The normalized phone number to update to the food truck's contact information.
     * @param {boolean} dryRun - Flag indicating whether the operation is a dry run; updates are skipped if true.
     * @param {CleanupOperation} operation - Object containing cleanup operation context including a record of errors.
     * @returns {Promise<void>} Does not return a value, but potentially modifies the truck and operation objects.
     * @description
     *   - Executes the update operation only if `dryRun` is false.
     *   - Pushes error messages to `operation.errors` on failure during the update process.
     *   - Uses `FoodTruckService.updateTruck` for updating the contact information.
     */
    private static applyPhoneNormalizationUpdate;
    /**
     * Helper to determine if coordinates need fixing and provide updates
     */
    private static getFixedCoordinates;
    /**
     * Fix invalid GPS coordinates
     */
    private static fixCoordinates;
    /**
     * Processes coordinates for a single food truck, applying any necessary fixes.
     * @example
     * processSingleTruckCoordinates(truck, context)
     * // No return value, function completes silently
     * @param {FoodTruck} truck - The food truck whose coordinates are to be processed.
     * @param {CoordinateProcessContext} context - Contains configuration and operation context for processing coordinates.
     * @returns {Promise<void>} Returns a promise that resolves when the processing and possible updates are complete.
     * @description
     *   - Skips processing if the truck's current location is not available.
     *   - Retrieves updates for fixed coordinates based on truck's current and default locations.
     *   - Applies updates conditionally based on context settings such as `dryRun` and `operation`.
     */
    private static processSingleTruckCoordinates;
    /**
     * Applies coordinate updates for a food truck's current location.
     * @example
     * applyCoordinateFixUpdate(truck, { lat: 34.05, lng: -118.25 }, false, operation)
     * // Updates the coordinates of the truck's location asynchronously.
     * @param {FoodTruck} truck - The food truck object whose coordinates need correction.
     * @param {Partial<FoodTruck['current_location']>} updates - The latitude and longitude updates to be applied.
     * @param {boolean} dryRun - Flag to simulate the update without altering data.
     * @param {CleanupOperation} operation - The cleanup operation instance used for error tracking.
     * @returns {Promise<void>} Resolves when the coordinate update process is complete.
     * @description
     *   - Executes the update operation only if the dryRun flag is false.
     *   - If the update fails, logs the error details into the operation's error array.
     */
    private static applyCoordinateFixUpdate;
    /**
     * Update quality scores for all trucks
     */
    private static updateQualityScores;
    /**
    * Processes a single food truck for an updated quality score assessment.
    * @example
    * processSingleTruckForQualityScore(truckInstance, false, cleanupOperationInstance)
    * // No return value
    * @param {FoodTruck} truck - The food truck instance to assess and potentially update.
    * @param {boolean} dryRun - Specifies whether this is a dry run (no actual data updates).
    * @param {CleanupOperation} operation - The cleanup operation context for processing.
    * @returns {Promise<void>} No return value; operation is performed asynchronously.
    * @description
    *   - Computes the quality score using data from DataQualityService.
    *   - Updates the quality score only if the score changes significantly (>5% difference).
    *   - Assumes `truck.data_quality_score` might be undefined, defaulting to 0.
    *   - Handles asynchronous processing of the update application if conditions are met.
    */
    private static processSingleTruckForQualityScore;
    /**
     * Updates the quality score of a specified food truck and handles errors during the update process.
     * @example
     * applyQualityScoreUpdate(foodTruckInstance, false, cleanupOperationInstance)
     * void
     * @param {FoodTruck} truck - The food truck for which the quality score will be updated.
     * @param {boolean} dryRun - Flag indicating whether the function should perform the update or just simulate it.
     * @param {CleanupOperation} operation - The cleanup operation containing possible error records.
     * @returns {Promise<void>} Resolves with no value when the update completes. Errors are recorded in the `operation` if thrown.
     * @description
     *   - Throws an error if the quality score update fails.
     *   - If `dryRun` is true, the function simulates the update without changing any data.
     *   - Errors occurring during the update are appended to the `operation.errors` array.
     */
    private static applyQualityScoreUpdate;
    /**
     * Identify and merge duplicate trucks
     */
    private static mergeDuplicates;
    /**
     * Processes a single food truck to detect and handle duplicates in the dataset.
     * @example
     * processSingleTruckForDuplicates(foodTruck, true, mergeContext)
     * // No return value. Performs operations as a side effect.
     * @param {FoodTruck} truck - An instance of FoodTruck to process for duplicates.
     * @param {boolean} dryRun - Flag indicating if the operation should be executed in dry run mode.
     * @param {MergeOperationContext} context - Operational context that carries state and configurations for the merge operation.
     * @returns {Promise<void>} Executes a set of operations for handling duplicate records, does not return any value.
     * @description
     *   - Ensures a food truck is only processed once by maintaining a set of processed IDs.
     *   - Uses DuplicatePreventionService to assess whether the given truck is a duplicate.
     *   - Applies a merge operation if a duplicate truck is confidently identified.
     */
    private static processSingleTruckForDuplicates;
    /**
     * Applies a merge operation between two food trucks and updates the context.
     * @example
     * applyMergeOperation(truck, existingTruck, true, context)
     * // Executes a dry run of the merge operation without affecting data
     * @param {FoodTruck} truck - The food truck that is being merged.
     * @param {FoodTruck} existingTruck - The existing food truck to merge with.
     * @param {boolean} dryRun - Indicates if the merge operation should be simulated.
     * @param {MergeOperationContext} context - Context containing details and state of the merge operation.
     * @returns {Promise<void>} Promise representing the completion of the merge operation.
     * @description
     *   - Updates the list of processed IDs in the context upon successful merge.
     *   - Throws and records an error if the merge operation fails.
     *   - Utilizes the DuplicatePreventionService for performing the merge.
     */
    private static applyMergeOperation;
    /**
     * Normalize phone number format
     */
    private static normalizePhone;
    /**
     * Get operation description
     */
    private static getOperationDescription;
    /**
     * Calculate cleanup summary
     */
    private static calculateSummary;
}
