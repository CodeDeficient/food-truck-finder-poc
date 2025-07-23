/**
 * SOTA Batch Data Cleanup System
 * Implements automated data quality improvements and cleanup operations
 */

import { FoodTruckService, DataQualityService } from '@/lib/supabase';
import type { FoodTruck, CleanupOperation, CleanupOperationType, BatchCleanupResult } from '@/lib/types';
import { DuplicatePreventionService } from './duplicatePrevention';
import { getPlaceholderPatterns, processTruckForPlaceholders } from './placeholderUtils';

// Re-export the types for backward compatibility
export type { CleanupOperation, CleanupOperationType, BatchCleanupResult };

interface MergeOperationContext {
  operation: CleanupOperation;
  processedIds: Set<string>;
}

interface CoordinateProcessContext {
  defaultLat: number;
  defaultLng: number;
  dryRun: boolean;
  operation: CleanupOperation;
}

/**
 * Automated Data Quality Cleanup Service
 */
export class BatchCleanupService {
  /**
   * Run comprehensive data cleanup operations
   */
  static async runFullCleanup(
    options: {
      batchSize?: number;
      dryRun?: boolean;
      operations?: CleanupOperation['type'][];
    } = {},
  ): Promise<BatchCleanupResult> {
    const startTime = Date.now();
    const {
      batchSize = 50,
      dryRun = false,
      operations = [
        'remove_placeholders',
        'normalize_phone',
        'fix_coordinates',
        'update_quality_scores',
        'merge_duplicates',
      ],
    } = options;

    console.info(`Starting batch cleanup (${dryRun ? 'DRY RUN' : 'LIVE'})...`);
    const result = this.initializeCleanupResult();
    try {
      const allTrucks = await FoodTruckService.getAllTrucks();
      result.totalProcessed = allTrucks.total;
      await this.processTrucksInBatches(allTrucks.trucks, {
        batchSize,
        operations,
        dryRun,
        result,
      });
      return this.finalizeCleanupResult(result, startTime);
    } catch (error) {
      console.error('Batch cleanup failed:', error);
      throw error;
    }
  }

  /**
  * Initializes and returns a new BatchCleanupResult object with default values.
  * @example
  * initializeCleanupResult()
  * { totalProcessed: 0, operations: [], summary: { trucksImproved: 0, duplicatesRemoved: 0, qualityScoreImprovement: 0, placeholdersRemoved: 0 }, duration: 0 }
  * @returns {BatchCleanupResult} A new BatchCleanupResult object with all properties set to initial default values.
  */
  private static initializeCleanupResult(): BatchCleanupResult {
    return {
      totalProcessed: 0,
      operations: [],
      summary: {
        trucksImproved: 0,
        duplicatesRemoved: 0,
        qualityScoreImprovement: 0,
        placeholdersRemoved: 0,
      },
      duration: 0,
    };
  }

  private static finalizeCleanupResult(
    result: BatchCleanupResult,
    startTime: number,
  ): BatchCleanupResult {
    result.summary = this.calculateSummary(result.operations);
    result.duration = Date.now() - startTime;

    console.info(`Batch cleanup completed in ${result.duration}ms`);
    return result;
  }

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
  private static async processTrucksInBatches(
    trucks: FoodTruck[],
    {
      batchSize,
      operations,
      dryRun,
      result,
    }: {
      batchSize: number;
      operations: CleanupOperation['type'][];
      dryRun: boolean;
      result: BatchCleanupResult;
    },
  ): Promise<void> {
    for (let i = 0; i < trucks.length; i += batchSize) {
      const batch = trucks.slice(i, i + batchSize);
      for (const op of operations) {
        const opResult = await this.runOperation(op, batch, dryRun);
        result.operations.push(opResult);
      }
    }
  }

  /**
   * Run a specific cleanup operation
   */
  private static async runOperation(
    type: CleanupOperation['type'],
    trucks: FoodTruck[],
    dryRun: boolean,
  ): Promise<CleanupOperation> {
    const operation: CleanupOperation = {
      type,
      description: this.getOperationDescription(type),
      affectedCount: 0,
      successCount: 0,
      errorCount: 0,
      errors: [],
    };

    const operationRunners = {
      remove_placeholders: this.runRemovePlaceholders,
      normalize_phone: this.runNormalizePhoneNumbers,
      fix_coordinates: this.runFixCoordinates,
      update_quality_scores: this.runUpdateQualityScores,
      merge_duplicates: this.runMergeDuplicates,
    };

    try {
      const runner = operationRunners[type];
      if (runner) {
        return await runner.call(this, trucks, dryRun, operation);
      } 
        operation.errors.push(`Unknown operation type: ${String(type)}`);
        return operation;
      
    } catch (error) {
      operation.errors.push(
        `Operation failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      return operation;
    }
  }

  private static runRemovePlaceholders = async (
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> => {
    return await this.removePlaceholders(trucks, dryRun, operation);
  };

  private static runNormalizePhoneNumbers = async (
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> => {
    return await this.normalizePhoneNumbers(trucks, dryRun, operation);
  };

  private static runFixCoordinates = async (
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> => {
    return await this.fixCoordinates(trucks, dryRun, operation);
  };

  private static runUpdateQualityScores = async (
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> => {
    return await this.updateQualityScores(trucks, dryRun, operation);
  };

  private static runMergeDuplicates = async (
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> => {
    return await this.mergeDuplicates(trucks, dryRun, operation);
  };

  /**
   * Remove placeholder and mock data
   */
  private static async removePlaceholders(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> {
    const placeholderPatterns = getPlaceholderPatterns();
    const promises = trucks.map((truck) =>
      this.processSingleTruckForPlaceholders(truck, placeholderPatterns, dryRun, operation),
    );
    await Promise.all(promises);
    return operation;
  }

  private static async processSingleTruckForPlaceholders(
    truck: FoodTruck,
    patterns: RegExp[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<void> {
    const updates = processTruckForPlaceholders(truck, patterns);
    if (updates && Object.keys(updates).length > 0) {
      await this.performUpdateOperation(truck.id, updates, dryRun, operation);
    }
  }

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
  private static async performUpdateOperation(
    truckId: string,
    updates: Partial<FoodTruck>,
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<void> {
    operation.affectedCount += 1;
    if (dryRun) {
      operation.successCount += 1;
    } else {
      try {
        await FoodTruckService.updateTruck(truckId, updates);
        operation.successCount += 1;
      } catch (error) {
        operation.errorCount += 1;
        operation.errors.push(
          `Failed to update truck ${truckId}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /**
   * Normalize phone numbers to consistent format
   */
  private static async normalizePhoneNumbers(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> {
    const promises = trucks.map((truck) => {
      if (truck.contact_info?.phone !== undefined) {
        const originalPhone = truck.contact_info.phone;
        const normalizedPhone = this.normalizePhone(originalPhone);

        if (normalizedPhone !== undefined && normalizedPhone !== originalPhone) {
          return this.applyPhoneNormalizationUpdate(truck, normalizedPhone, dryRun, operation);
        }
      }
      return Promise.resolve();
    });
    await Promise.all(promises);
    return operation;
  }

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
  private static async applyPhoneNormalizationUpdate(
    truck: FoodTruck,
    normalizedPhone: string,
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<void> {
    operation.affectedCount += 1;
    if (dryRun) {
      operation.successCount += 1;
    } else {
      try {
        await FoodTruckService.updateTruck(truck.id, {
          contact_info: {
            ...truck.contact_info,
            phone: normalizedPhone,
          },
        });
        operation.successCount += 1;
      } catch (error) {
        operation.errorCount += 1;
        operation.errors.push(
          `Failed to normalize phone for truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /**
   * Helper to determine if coordinates need fixing and provide updates
   */
  private static getFixedCoordinates(
    lat: number | undefined,
    lng: number | undefined,
    defaultLat: number,
    defaultLng: number,
  ): Partial<FoodTruck['current_location']> | undefined {
    // Fix invalid coordinates (0,0 or undefined)
    if (lat === undefined || lng === undefined || lat === 0 || lng === 0) {
      return { lat: defaultLat, lng: defaultLng };
    }
    // Fix coordinates outside reasonable bounds for Charleston area
    if (lat < 32 || lat > 34 || lng > -79 || lng < -81) {
      return { lat: defaultLat, lng: defaultLng };
    }
    return undefined;
  }

  /**
   * Fix invalid GPS coordinates
   */
  private static async fixCoordinates(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> {
    const context: Omit<CoordinateProcessContext, 'operation'> = {
      defaultLat: 32.7767,
      defaultLng: -79.9311,
      dryRun,
    };

    const promises = trucks.map((truck) =>
      this.processSingleTruckCoordinates(truck, { ...context, operation }),
    );
    await Promise.all(promises);
    return operation;
  }

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
  private static async processSingleTruckCoordinates(
    truck: FoodTruck,
    context: CoordinateProcessContext,
  ): Promise<void> {
    if (!truck.current_location) return;
    const { defaultLat, defaultLng, dryRun, operation } = context;
    const { lat, lng } = truck.current_location;
    const updates = this.getFixedCoordinates(lat, lng, defaultLat, defaultLng);
    if (updates) {
      await this.applyCoordinateFixUpdate(truck, updates, dryRun, operation);
    }
  }

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
  private static async applyCoordinateFixUpdate(
    truck: FoodTruck,
    updates: Partial<FoodTruck['current_location']>,
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<void> {
    operation.affectedCount += 1;
    if (dryRun) {
      operation.successCount += 1;
    } else {
      try {
        await FoodTruckService.updateTruck(truck.id, {
          current_location: {
            ...truck.current_location,
            ...updates,
          },
        });
        operation.successCount += 1;
      } catch (error) {
        operation.errorCount += 1;
        operation.errors.push(
          `Failed to fix coordinates for truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /**
   * Update quality scores for all trucks
   */
  private static async updateQualityScores(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> {
    const promises = trucks.map((truck) =>
      this.processSingleTruckForQualityScore(truck, dryRun, operation),
    );
    await Promise.all(promises);
    return operation;
  }

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
  private static async processSingleTruckForQualityScore(
    truck: FoodTruck,
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<void> {
    const qualityAssessment = DataQualityService.calculateQualityScore(truck);
    if (qualityAssessment) {
      const newScore = qualityAssessment.score;
      const currentScore = truck.data_quality_score ?? 0;
      // Only update if score changed significantly (>5% difference)
      if (typeof newScore === 'number' && Math.abs(newScore - currentScore) > 0.05) {
        await this.applyQualityScoreUpdate(truck, dryRun, operation);
      }
    }
  }

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
  private static async applyQualityScoreUpdate(
    truck: FoodTruck,
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<void> {
    operation.affectedCount += 1;
    if (dryRun) {
      operation.successCount += 1;
    } else {
      try {
        const updateResult = await DataQualityService.updateTruckQualityScore(truck.id);
        if ('error' in updateResult) {
          throw new Error(updateResult.error);
        }
        operation.successCount += 1;
      } catch (error) {
        operation.errorCount += 1;
        operation.errors.push(
          `Failed to update quality score for truck ${truck.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /**
   * Identify and merge duplicate trucks
   */
  private static async mergeDuplicates(
    trucks: FoodTruck[],
    dryRun: boolean,
    operation: CleanupOperation,
  ): Promise<CleanupOperation> {
    const processedIds = new Set<string>();
    for (const truck of trucks) {
      await this.processSingleTruckForDuplicates(truck, dryRun, { operation, processedIds });
    }
    return operation;
  }

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
  private static async processSingleTruckForDuplicates(
    truck: FoodTruck,
    dryRun: boolean,
    context: MergeOperationContext,
  ): Promise<void> {
    const { processedIds } = context;
    if (processedIds.has(truck.id)) return;

    const duplicateCheck = await DuplicatePreventionService.checkForDuplicates(truck);
    if (
      duplicateCheck.isDuplicate &&
      duplicateCheck.bestMatch?.confidence === 'high' &&
      duplicateCheck.bestMatch.recommendation === 'merge'
    ) {
      await this.applyMergeOperation(
        truck,
        duplicateCheck.bestMatch.existingTruck,
        dryRun,
        context,
      );
    }
    processedIds.add(truck.id);
  }

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
  private static async applyMergeOperation(
    truck: FoodTruck,
    existingTruck: FoodTruck,
    dryRun: boolean,
    context: MergeOperationContext,
  ): Promise<void> {
    const { operation, processedIds } = context;
    operation.affectedCount += 1;
    if (dryRun) {
      operation.successCount += 1;
    } else {
      try {
        const mergeResult = await DuplicatePreventionService.mergeDuplicates(
          truck.id,
          existingTruck.id,
        );
        if ('error' in mergeResult) {
          throw new Error(mergeResult.error);
        }
        processedIds.add(existingTruck.id);
        operation.successCount += 1;
      } catch (error) {
        operation.errorCount += 1;
        operation.errors.push(
          `Failed to merge duplicates ${truck.id} and ${existingTruck.id}: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    }
  }

  /**
   * Normalize phone number format
   */
  private static normalizePhone(phone: string): string | undefined {
    if (!phone) return undefined;

    // Remove all non-digit characters
    const digits = phone.replaceAll(/\D/g, '');

    // Handle US phone numbers
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }

    // Return original if can't normalize
    return phone;
  }

  /**
   * Get operation description
   */
  private static getOperationDescription(type: CleanupOperation['type']): string {
    const descriptions = {
      remove_placeholders: 'Remove placeholder and mock data values',
      normalize_phone: 'Normalize phone numbers to consistent format',
      fix_coordinates: 'Fix invalid GPS coordinates',
      update_quality_scores: 'Recalculate data quality scores',
      merge_duplicates: 'Identify and merge duplicate truck entries',
    };

    return descriptions[type] ?? 'Unknown operation';
  }

  /**
   * Calculate cleanup summary
   */
  private static calculateSummary(operations: CleanupOperation[]): BatchCleanupResult['summary'] {
    return {
      trucksImproved: operations.reduce((sum, op) => sum + op.successCount, 0),
      duplicatesRemoved: operations.find((op) => op.type === 'merge_duplicates')?.successCount ?? 0,
      qualityScoreImprovement:
        operations.find((op) => op.type === 'update_quality_scores')?.successCount ?? 0,
      placeholdersRemoved:
        operations.find((op) => op.type === 'remove_placeholders')?.successCount ?? 0,
    };
  }
}
