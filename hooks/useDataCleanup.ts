'use client';

import { useState } from 'react';

export interface CleanupOperation {
  type: string;
  description: string;
  affectedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

export interface CleanupResult {
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
 * Custom hook to manage data cleanup operations.
 * @example
 * const {
 *   isRunning,
 *   lastResult,
 *   previewData,
 *   selectedOperations,
 *   runCleanup,
 *   loadPreview,
 *   toggleOperation,
 * } = useDataCleanup();
 * @param {boolean} dryRun - A flag indicating whether to run a dry-run or full cleanup.
 * @returns {Object} An object containing state and functions for managing the data cleanup process.
 * @description
 *   - Initializes with a default set of cleanup operations.
 *   - Handles asynchronous operations for running cleanup and loading previews.
 *   - Allows toggling of selected operations dynamically.
 */
export function useDataCleanup() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<CleanupResult | undefined>();
  const [previewData, setPreviewData] = useState<unknown>();
  const [selectedOperations, setSelectedOperations] = useState<string[]>([
    'remove_placeholders',
    'normalize_phone',
    'fix_coordinates',
    'update_quality_scores',
  ]);

  /**
   * Initiates a data cleanup operation with optional dry run mode.
   * @example
   * sync(true)
   * // Executes a dry run cleanup operation
   * @param {boolean} dryRun - If true, simulates the cleanup without making actual changes.
   * @returns {Promise<void>} Resolves when the operation is complete, logging errors if any occur.
   * @description
   *   - Sends a POST request to '/api/admin/data-cleanup' endpoint with specified operations and parameters.
   *   - Uses 'setIsRunning', 'setLastResult' to manage state during the operation.
   *   - Handles success and error responses, logging them to the console.
   */
  const runCleanup = async (dryRun: boolean = false) => {
    setIsRunning(true);
    try {
      const response = await fetch('/api/admin/data-cleanup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: dryRun ? 'dry-run' : 'full-cleanup',
          options: {
            operations: selectedOperations,
            batchSize: 50,
            dryRun,
          },
        }),
      });

      const data = (await response.json()) as {
        success: boolean;
        result?: CleanupResult;
        error?: string;
      };

      if (data.success === true) {
        setLastResult(data.result);
      } else {
        console.error('Cleanup failed:', data.error);
      }
    } catch (error) {
      console.error('Error running cleanup:', error);
    } finally {
      setIsRunning(false);
    }
  };

  /**
  * Fetches and sets preview data from the admin data cleanup API.
  * @example
  * sync()
  * undefined
  * @returns {Promise<void>} Returns a promise that resolves when the preview data is set.
  * @description
  *   - Uses the Fetch API to request data from the server.
  *   - Parses the JSON response to extract the success flag and preview data.
  *   - Logs any errors that occur during the fetching process.
  *   - Calls 'setPreviewData' if the API request is successful.
  */
  const loadPreview = async () => {
    try {
      const response = await fetch('/api/admin/data-cleanup?action=preview');
      const data = (await response.json()) as { success: boolean; preview?: unknown };

      if (data.success === true) {
        setPreviewData(data.preview);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    }
  };

  const toggleOperation = (operation: string) => {
    setSelectedOperations((prev) =>
      (prev.includes(operation) ? prev.filter((op) => op !== operation) : [...prev, operation]),
    );
  };

  return {
    isRunning,
    lastResult,
    previewData,
    selectedOperations,
    runCleanup,
    loadPreview,
    toggleOperation,
  };
}
