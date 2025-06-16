'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Trash2, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Play,
  Eye,
  Merge,
  Phone,
  MapPin,
  Star
} from 'lucide-react';

interface CleanupOperation {
  type: string;
  description: string;
  affectedCount: number;
  successCount: number;
  errorCount: number;
  errors: string[];
}

interface CleanupResult {
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

export function DataCleanupDashboard() {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<CleanupResult | undefined>();
  const [previewData, setPreviewData] = useState<unknown>();
  const [selectedOperations, setSelectedOperations] = useState<string[]>([
    'remove_placeholders',
    'normalize_phone',
    'fix_coordinates',
    'update_quality_scores'
  ]);

  const operationConfig = {
    remove_placeholders: {
      name: 'Remove Placeholders',
      description: 'Remove placeholder and mock data values',
      icon: <Trash2 className="h-4 w-4" />,
      color: 'text-red-600'
    },
    normalize_phone: {
      name: 'Normalize Phone Numbers',
      description: 'Format phone numbers consistently',
      icon: <Phone className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    fix_coordinates: {
      name: 'Fix GPS Coordinates',
      description: 'Correct invalid location coordinates',
      icon: <MapPin className="h-4 w-4" />,
      color: 'text-green-600'
    },
    update_quality_scores: {
      name: 'Update Quality Scores',
      description: 'Recalculate data quality scores',
      icon: <Star className="h-4 w-4" />,
      color: 'text-yellow-600'
    },
    merge_duplicates: {
      name: 'Merge Duplicates',
      description: 'Identify and merge duplicate entries',
      icon: <Merge className="h-4 w-4" />,
      color: 'text-purple-600'
    }
  };

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
            dryRun
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
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
      const data = await response.json();
      
      if (data.success) {
        setPreviewData(data.preview);
      }
    } catch (error) {
      console.error('Error loading preview:', error);
    }
  };

  const toggleOperation = (operation: string) => {
    setSelectedOperations(prev => 
      prev.includes(operation)
        ? prev.filter(op => op !== operation)
        : [...prev, operation]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Data Cleanup & Quality</h2>
          <p className="text-muted-foreground">
            Automated data quality improvements and duplicate prevention
          </p>
        </div>
        <div className="flex gap-2">
          {/* @ts-expect-error TS(2322): Type '{ children: (string | Element)[]; variant: s... Remove this comment to see the full error message */}
          <Button variant="outline" onClick={loadPreview} disabled={isRunning}>
            <Eye className="h-4 w-4 mr-2" />
            Preview Changes
          </Button>
          {/* @ts-expect-error TS(2322): Type '{ children: (string | Element)[]; variant: s... Remove this comment to see the full error message */}
          <Button variant="outline" onClick={() => runCleanup(true)} disabled={isRunning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            Dry Run
          </Button>
          <Button onClick={() => runCleanup(false)} disabled={isRunning}>
            <Play className="h-4 w-4 mr-2" />
            Run Cleanup
          </Button>
        </div>
      </div>

      {/* Operation Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Cleanup Operations</CardTitle>
          <CardDescription>
            Select which cleanup operations to run
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(operationConfig).map(([key, config]) => (
              <div
                key={key}
                className={`flex items-center space-x-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedOperations.includes(key)
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => toggleOperation(key)}
              >
                <div className={config.color}>
                  {config.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{config.name}</div>
                  <div className="text-xs text-muted-foreground">{config.description}</div>
                </div>
                {selectedOperations.includes(key) && (
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Preview Data */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Cleanup Preview</CardTitle>
            <CardDescription>
              Estimated changes (based on sample of 10 trucks)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {previewData.estimated_improvements}
                </div>
                <div className="text-sm text-muted-foreground">Trucks to Improve</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {previewData.estimated_duplicates}
                </div>
                <div className="text-sm text-muted-foreground">Duplicates Found</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {previewData.operations?.length ?? 0}
                </div>
                <div className="text-sm text-muted-foreground">Operations Ready</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  ~{Math.round((previewData.estimated_improvements / 10) * 100)}%
                </div>
                <div className="text-sm text-muted-foreground">Improvement Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Cleanup Result */}
      {lastResult && (
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
      )}

      {/* Help & Information */}
      <Card>
        <CardHeader>
          <CardTitle>Cleanup Operations Guide</CardTitle>
          <CardDescription>
            Understanding what each cleanup operation does
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div>
              <strong>Remove Placeholders:</strong> Removes test data, "undefined" values, and placeholder content that shouldn't be in production.
            </div>
            <div>
              <strong>Normalize Phone Numbers:</strong> Formats phone numbers consistently (e.g., "(843) 555-0123").
            </div>
            <div>
              <strong>Fix GPS Coordinates:</strong> Corrects invalid coordinates (0,0) and coordinates outside the Charleston area.
            </div>
            <div>
              <strong>Update Quality Scores:</strong> Recalculates data quality scores based on current data completeness.
            </div>
            <div>
              <strong>Merge Duplicates:</strong> Identifies and merges duplicate food truck entries automatically.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
