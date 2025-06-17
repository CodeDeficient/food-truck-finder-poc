/*
  Test Pipeline Admin Page

  Purpose:
  This page provides an interface for manually testing the entire data pipeline,
  from web scraping with Firecrawl, through data extraction with Gemini,
  to data preparation and (optional) saving to Supabase. It allows for step-by-step
  inspection of outputs from each stage, aiding in debugging, prompt engineering,
  and validation of the pipeline's components.

  How to Use:
  1. Input a url to test the full scraping and processing flow.
  2. Alternatively, select "Use Raw Text Input Instead" and paste Markdown/html
     directly into the textarea to test only the Gemini processing stage onwards.
  3. Use the "Dry Run" checkbox to control whether data is actually saved to
     Supabase or if the save operation is just simulated. By default, it's a dry run.
  4. Click "Run Test" to execute the pipeline with the provided inputs.
  5. Results from each stage (Firecrawl, Gemini, Supabase) will be displayed in tabs,
     including status, raw outputs, processed data, errors, and relevant metadata
     (like prompts sent to Gemini or tokens used).

  Automated Testing:
  As part of a comprehensive testing strategy, placeholder files for automated unit tests
  (e.g., `firecrawl.test.ts`, `gemini.test.ts`, `pipelineProcessor.test.ts`) have been
  added to the `lib/` directory. These outline future tests to be implemented using a
  framework like Jest or Vitest.
*/
'use client';

/*
Admin Dashboard Architecture Proposal (wbs 3.1.2)
--------------------------------------------------
Recommended Approach: Sub-domain or separate route within the existing Next.js app, with robust access control.

- Security: Use Supabase rls and custom roles to restrict access. Consider deploying the admin dashboard at /admin or on a sub-domain (admin.yoursite.com) for separation.
- Separation of Concerns: Keep admin components, logic, and styles in a dedicated /admin directory. Avoid mixing admin and user-facing code.
- Maintainability: Modularize admin features (data editing, pipeline monitoring, quality management) as separate components/pages.
- Authentication: Require login with admin role for all admin routes. Use Supabase Auth or a similar provider.
- Deployment: Can be deployed as part of the main app or as a separate Next.js app if stricter separation is needed in the future.
*/

import { useState, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // If you want to use tabs for results
import {
  StageResult,
  TestPipelineResults,
  // FirecrawlOutputData, // Already imported via StageResult's data union if needed directly
  // ExtractedFoodTruckDetails, // Already imported via StageResult's data union
  // FoodTruckSchema // Already imported via StageResult's data union
} from '@/lib/types';

export default function TestPipelinePage() {
  const [url, setUrl] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [useRawText, setUseRawText] = useState<boolean>(false);
  const [isDryRun, setIsDryRun] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<TestPipelineResults | undefined>();
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setResults(undefined);
    setError(undefined);

    const payload = {
      url: useRawText ? undefined : url,
      rawText: useRawText ? rawText : undefined,
      isDryRun,
    };
    try {
      const response = await fetch('/api/test-pipeline-run', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as TestPipelineResults;

      if (!response.ok) {
        throw new Error(data.error ?? 'Test run failed');
      }
      setResults(data);
    } catch (error_) {
      const errorMessage = error_ instanceof Error ? error_.message : 'An unknown error occurred';
      setError(errorMessage);
      setResults({ error: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };
  const renderStageResult = (stageName: string, result?: StageResult) => {
    if (!result) return;
    return (
      <Card className="mt-4">
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
          {result.error != undefined && (
            <p className="text-red-500">
              <strong>Error:</strong> {result.error}
            </p>
          )}
          {result.details != undefined && (
            <p>
              <strong>Details:</strong> {result.details}
            </p>
          )}
          {result.prompt != undefined && (
            <div>
              <strong>Prompt:</strong>
              <Textarea
                readOnly
                value={result.prompt}
                className="mt-1 h-32 bg-gray-50 dark:bg-slate-700"
              />
            </div>
          )}
          {result.rawContent != undefined && (
            <div>
              <strong>Raw Content (Firecrawl):</strong>
              <Textarea
                readOnly
                value={result.rawContent}
                className="mt-1 h-48 bg-gray-50 dark:bg-slate-700"
              />
            </div>
          )}
          {result.data != undefined && (
            <div className="mt-2">
              <strong>Data Output:</strong>{' '}
              <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
                {/* eslint-disable-next-line unicorn/no-null */}
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          )}
          {result.preparedData != undefined && (
            <div className="mt-2">
              <strong>Data Prepared for Supabase:</strong>{' '}
              <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
                {/* eslint-disable-next-line unicorn/no-null */}
                {JSON.stringify(result.preparedData, null, 2)}
              </pre>
            </div>
          )}
          {result.recordId != undefined && (
            <p>
              <strong>Supabase Record id:</strong> {result.recordId}
            </p>
          )}
          {result.tokensUsed !== undefined != undefined && (
            <p>
              <strong>Gemini Tokens Used:</strong> {result.tokensUsed}
            </p>
          )}
          {result.metadata != undefined && (
            <div>
              <strong>Metadata (Firecrawl):</strong>{' '}
              <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
                {/* eslint-disable-next-line unicorn/no-null */}
                {JSON.stringify(result.metadata, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Test Data Pipeline</CardTitle>
          <CardDescription>
            Use this page to test the data scraping and processing pipeline with a specific url or
            raw text.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              handleSubmit(e).catch(error => {
                console.warn('Form submission failed:', error);
              });
            }}
            className="space-y-6"
          >
            <div>
              <Label htmlFor="url-input">url to Scrape</Label>
              <Input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={useRawText || isLoading}
                className="mt-1"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="use-raw-text-checkbox"
                checked={useRawText}
                onCheckedChange={(checked: boolean) => setUseRawText(Boolean(checked))}
                disabled={isLoading}
              />
              <Label htmlFor="use-raw-text-checkbox">Use Raw Text Input Instead</Label>
            </div>

            <div>
              <Label htmlFor="raw-text-input">Raw Text (Markdown/html)</Label>
              <Textarea
                id="raw-text-input"
                placeholder="Paste Markdown or html content here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                disabled={!useRawText || isLoading}
                className="mt-1 h-40"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="dry-run-checkbox"
                checked={isDryRun}
                onCheckedChange={(checked: boolean) => setIsDryRun(Boolean(checked))}
                disabled={isLoading}
              />
              <Label htmlFor="dry-run-checkbox">Dry Run (Do not save to Supabase)</Label>
            </div>

            <Button type="submit" disabled={isLoading || (useRawText ? !rawText : !url)}>
              {isLoading ? 'Testing...' : 'Run Test'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {error != undefined && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-600">Test Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {results != undefined && !results.error && (
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
      )}
    </div>
  );
}
