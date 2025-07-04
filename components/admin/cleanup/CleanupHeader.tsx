'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, RefreshCw, Play } from 'lucide-react';

interface CleanupHeaderProps {
  readonly isRunning: boolean;
  readonly onPreview: () => void;
  readonly onDryRun: () => void;
  readonly onRunCleanup: () => void;
}

export function CleanupHeader({
  isRunning,
  onPreview,
  onDryRun,
  onRunCleanup,
}: Readonly<CleanupHeaderProps>) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Data Cleanup & Quality</h2>
        <p className="text-muted-foreground">
          Automated data quality improvements and duplicate prevention
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onPreview} disabled={isRunning}>
          <Eye className="size-4 mr-2" />
          Preview Changes
        </Button>
        <Button variant="outline" onClick={onDryRun} disabled={isRunning}>
          <RefreshCw className={`size-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          Dry Run
        </Button>
        <Button onClick={onRunCleanup} disabled={isRunning}>
          <Play className="size-4 mr-2" />
          Run Cleanup
        </Button>
      </div>
    </div>
  );
}
