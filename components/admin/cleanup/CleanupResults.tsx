'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { CleanupResult } from '@/hooks/useDataCleanup';
import { CleanupOperationDetails } from './CleanupOperationDetails';
import { CleanupSummaryCards } from './CleanupSummaryCards'; // Import the new component

interface CleanupResultsProps {
  readonly lastResult: CleanupResult;
}

export function CleanupResults({ lastResult }: CleanupResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="size-5 text-green-600" />
          Last Cleanup Results
        </CardTitle>
        <CardDescription>
          Completed in {Math.round(lastResult.duration / 1000)}s - {lastResult.totalProcessed}{' '}
          trucks processed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <CleanupSummaryCards lastResult={lastResult} />
        <CleanupOperationDetails operations={lastResult.operations} />
      </CardContent>
    </Card>
  );
}
