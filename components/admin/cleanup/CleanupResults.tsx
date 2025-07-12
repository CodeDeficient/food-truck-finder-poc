'use client';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { CleanupResult } from '@/hooks/useDataCleanup';
import { CleanupOperationDetails } from './CleanupOperationDetails';
import { CleanupSummaryCards } from './CleanupSummaryCards'; // Import the new component

interface CleanupResultsProps {
  readonly lastResult: CleanupResult;
}

/**
 * Displays the results of the last cleanup operation in a card format.
 * @example
 * CleanupResults({ lastResult: { duration: 12000, totalProcessed: 150, operations: [...] } })
 * <Card>...</Card>
 * @param {CleanupResultsProps} {lastResult} - Contains details of the last cleanup operation including duration and processed trucks.
 * @returns {JSX.Element} A card with cleanup results summary and operation details.
 * @description
 *   - Uses a flex layout to align card title elements.
 *   - Converts duration from milliseconds to seconds in the description.
 *   - Displays a summary of operations within the card content.
 */
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
