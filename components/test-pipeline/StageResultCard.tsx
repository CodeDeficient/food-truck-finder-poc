import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { StageResult } from '@/lib/types';

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
        {result.error !== undefined && (
          <p className="text-red-500">
            <strong>Error:</strong> {result.error}
          </p>
        )}
        {result.details !== undefined && (
          <p>
            <strong>Details:</strong> {result.details}
          </p>
        )}
        {result.prompt !== undefined && (
          <div>
            <strong>Prompt:</strong>
            <Textarea
              readOnly
              value={result.prompt}
              className="mt-1 h-32 bg-gray-50 dark:bg-slate-700"
            />
          </div>
        )}
        {result.rawContent !== undefined && (
          <div>
            <strong>Raw Content (Firecrawl):</strong>
            <Textarea
              readOnly
              value={result.rawContent}
              className="mt-1 h-48 bg-gray-50 dark:bg-slate-700"
            />
          </div>
        )}
        {result.data !== undefined && (
          <div className="mt-2">
            <strong>Data Output:</strong>{' '}
            <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        )}
        {result.preparedData !== undefined && (
          <div className="mt-2">
            <strong>Data Prepared for Supabase:</strong>{' '}
            <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(result.preparedData, null, 2)}
            </pre>
          </div>
        )}
        {result.recordId !== undefined && (
          <p>
            <strong>Supabase Record id:</strong> {result.recordId}
          </p>
        )}
        {result.tokensUsed !== undefined && (
          <p>
            <strong>Gemini Tokens Used:</strong> {result.tokensUsed}
          </p>
        )}
        {result.metadata !== undefined && (
          <div>
            <strong>Metadata (Firecrawl):</strong>{' '}
            <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
              {JSON.stringify(result.metadata, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
