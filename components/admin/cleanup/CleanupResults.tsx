'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { CleanupResult } from '@/hooks/useDataCleanup';
import { operationConfig } from './OperationSelector';

interface CleanupResultsProps {
  lastResult: CleanupResult;
}

export function CleanupResults({ lastResult }: CleanupResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          Last Cleanup Results
        </CardTitle>
        <CardDescription>
          Completed in {Math.round(lastResult.duration / 1000)}s - {lastResult.totalProcessed} trucks processed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {lastResult.summary.trucksImproved}
            </div>
            <div className="text-sm text-blue-700 dark:text-blue-300">Trucks Improved</div>
          </div>
          <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {lastResult.summary.duplicatesRemoved}
            </div>
            <div className="text-sm text-purple-700 dark:text-purple-300">Duplicates Removed</div>
          </div>
          <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {lastResult.summary.qualityScoreImprovement}
            </div>
            <div className="text-sm text-green-700 dark:text-green-300">Quality Updates</div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {lastResult.summary.placeholdersRemoved}
            </div>
            <div className="text-sm text-red-700 dark:text-red-300">Placeholders Removed</div>
          </div>
        </div>

        {/* Operation Details */}
        <div className="space-y-3">
          <h4 className="font-semibold">Operation Details</h4>
          {lastResult.operations.map((operation, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {operationConfig[operation.type as keyof typeof operationConfig]?.icon}
                  <span className="font-medium">{operation.description}</span>
                </div>
                <Badge variant={operation.errorCount > 0 ? 'destructive' : 'default'}>
                  {operation.successCount}/{operation.affectedCount}
                </Badge>
              </div>
              
              {operation.affectedCount > 0 && (
                <Progress 
                  value={(operation.successCount / operation.affectedCount) * 100} 
                  className="h-2 mb-2"
                />
              )}
              
              {operation.errors.length > 0 && (
                <Alert variant="destructive" className="mt-2">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Errors ({operation.errors.length})</AlertTitle>
                  <AlertDescription>
                    <div className="max-h-20 overflow-y-auto text-xs">
                      {operation.errors.slice(0, 3).map((error, i) => (
                        <div key={i}>{error}</div>
                      ))}
                      {operation.errors.length > 3 && (
                        <div>... and {operation.errors.length - 3} more</div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
