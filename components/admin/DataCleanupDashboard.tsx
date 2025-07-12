'use client';


import { useDataCleanup } from '@/hooks/useDataCleanup';
import { CleanupHeader } from './cleanup/CleanupHeader';
import { OperationSelector } from './cleanup/OperationSelector';
import { CleanupPreview } from './cleanup/CleanupPreview';
import { CleanupResults } from './cleanup/CleanupResults';
import { CleanupGuide } from './cleanup/CleanupGuide';

/**
 * Displays the data cleanup process dashboard in the admin interface.
 * @example
 * DataCleanupDashboard()
 * Returns a JSX element containing the data cleanup dashboard UI components.
 * @returns {JSX.Element} A JSX structure containing components for the data cleanup dashboard.
 * @description
 *   - Utilizes multiple hooks from `useDataCleanup` to manage state and operations related to data cleanup.
 *   - Composes several child components to form the complete dashboard interface, including headers, selectors, previews, and guides.
 *   - Handles user interactions for previewing, dry running, and executing data cleanup operations.
 */
export function DataCleanupDashboard() {
  const {
    isRunning,
    lastResult,
    previewData,
    selectedOperations,
    runCleanup,
    loadPreview,
    toggleOperation,
  } = useDataCleanup();

  return (
    <div className="space-y-6">
      <CleanupHeader
        isRunning={isRunning}
        onPreview={() => {
          void loadPreview();
        }}
        onDryRun={() => {
          void runCleanup(true);
        }}
        onRunCleanup={() => {
          void runCleanup(false);
        }}
      />

      <OperationSelector
        selectedOperations={selectedOperations}
        onToggleOperation={toggleOperation}
      />

      <CleanupPreview previewData={previewData} />

      {lastResult && <CleanupResults lastResult={lastResult} />}

      <CleanupGuide />
    </div>
  );
}
