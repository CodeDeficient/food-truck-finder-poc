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
      prev.includes(operation) ? prev.filter((op) => op !== operation) : [...prev, operation],
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
