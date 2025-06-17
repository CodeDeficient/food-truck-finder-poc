'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CleanupPreviewProps {
  previewData: unknown;
}

export function CleanupPreview({ previewData }: CleanupPreviewProps) {
  if (previewData == undefined) {
    return undefined;
  }

  return (
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
              {(previewData as { estimated_improvements: number }).estimated_improvements}
            </div>
            <div className="text-sm text-muted-foreground">Trucks to Improve</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(previewData as { estimated_duplicates: number }).estimated_duplicates}
            </div>
            <div className="text-sm text-muted-foreground">Duplicates Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(previewData as { operations?: unknown[] }).operations?.length ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Operations Ready</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ~{Math.round(((previewData as { estimated_improvements: number }).estimated_improvements / 10) * 100)}%
            </div>
            <div className="text-sm text-muted-foreground">Improvement Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
