import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StageResult, TestPipelineResults } from '@/lib/types';

export function TestResultsDisplay({
  results,
  renderStageResult
}: {
  results?: TestPipelineResults;
  renderStageResult: (stageName: string, result?: StageResult) => React.ReactElement | undefined;
}) {
  if (!results || results.error != undefined) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Results</CardTitle>
        {results.overallStatus != undefined && (
          <CardDescription>Overall Status: {results.overallStatus}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="firecrawl" className="w-full">
          <TabsList>
            <TabsTrigger value="firecrawl" disabled={!results.firecrawl}>
              Firecrawl
            </TabsTrigger>
            <TabsTrigger value="gemini" disabled={!results.gemini}>
              Gemini
            </TabsTrigger>
            <TabsTrigger value="supabase" disabled={!results.supabase}>
              Supabase
            </TabsTrigger>
          </TabsList>
          <TabsContent value="firecrawl">
            {renderStageResult('Firecrawl Stage', results.firecrawl)}
          </TabsContent>
          <TabsContent value="gemini">
            {renderStageResult('Gemini Processing Stage', results.gemini)}
          </TabsContent>
          <TabsContent value="supabase">
            {renderStageResult('Supabase Interaction Stage', results.supabase)}
          </TabsContent>
        </Tabs>
        {results.logs != undefined && results.logs.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold">Logs:</h3>
            <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-800 rounded-md overflow-x-auto text-sm">
              {results.logs.join('\n')}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
