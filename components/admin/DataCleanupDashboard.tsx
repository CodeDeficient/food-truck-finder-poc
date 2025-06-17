'use client';

import React from 'react';
import { useDataCleanup } from '@/hooks/useDataCleanup';
import { CleanupHeader } from './cleanup/CleanupHeader';
import { OperationSelector } from './cleanup/OperationSelector';
import { CleanupPreview } from './cleanup/CleanupPreview';
import { CleanupResults } from './cleanup/CleanupResults';
import { CleanupGuide } from './cleanup/CleanupGuide';

export function DataCleanupDashboard() {
  const {
    isRunning,
    lastResult,
    previewData,
    selectedOperations,
    runCleanup,
    loadPreview,
    toggleOperation
  } = useDataCleanup();





  return (
    <div className="space-y-6">
      <CleanupHeader
        isRunning={isRunning}
        onPreview={() => { void loadPreview(); }}
        onDryRun={() => { void runCleanup(true); }}
        onRunCleanup={() => { void runCleanup(false); }}
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
