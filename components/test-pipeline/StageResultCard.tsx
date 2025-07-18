import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { StageResult } from '@/lib/types';
import { StageResultDetails } from './StageResultDetails';

interface StageResultCardProps {
  readonly stageName: string;
  readonly result?: StageResult;
}

export function StageResultCard({ stageName, result }: Readonly<StageResultCardProps>) {
  if (!result) return;

  return (
    <Card className="border-red-500">
      <CardHeader>
        <CardTitle>{stageName}</CardTitle>
        <CardDescription>
          Status:{' '}
          <span className={result.status === 'Success' ? 'text-green-500' : 'text-red-500'}>
            {result.status}
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <StageResultDetails result={result} />
      </CardContent>
    </Card>
  );
}
