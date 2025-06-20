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

// Individual content display components for StageResultCard
function StageResultError({ error }: { readonly error?: string }) {
  if (error === undefined) {
    return;
  }
  return (
    <p className="text-red-500">
      <strong>Error:</strong> {error}
    </p>
  );
}

function StageResultDetails({ details }: { readonly details?: string }) {
  if (details === undefined) {
    return;
  }
  return (
    <p>
      <strong>Details:</strong> {details}
    </p>
  );
}

function StageResultPrompt({ prompt }: { readonly prompt?: string }) {
  if (prompt === undefined) {
    return;
  }
  return (
    <div>
      <strong>Prompt:</strong>
      <Textarea
        readOnly
        value={prompt}
        className="mt-1 h-32 bg-gray-50 dark:bg-slate-700"
      />
    </div>
  );
}

function StageResultRawContent({ rawContent }: { readonly rawContent?: string }) {
  if (rawContent === undefined) {
    return;
  }
  return (
    <div>
      <strong>Raw Content (Firecrawl):</strong>
      <Textarea
        readOnly
        value={rawContent}
        className="mt-1 h-48 bg-gray-50 dark:bg-slate-700"
      />
    </div>
  );
}

function StageResultJsonDisplay({ data, title }: { readonly data?: unknown; readonly title: string }) {
  if (data === undefined) {
    return;
  }
  return (
    <div className="mt-2">
      <strong>{title}:</strong>{' '}
      <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
        {/* eslint-disable-next-line unicorn/no-null */}
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

function StageResultRecordId({ recordId }: { readonly recordId?: string }) {
  if (recordId === undefined) {
    return;
  }
  return (
    <p>
      <strong>Supabase Record id:</strong> {recordId}
    </p>
  );
}

function StageResultTokensUsed({ tokensUsed }: { readonly tokensUsed?: number }) {
  if (tokensUsed === undefined) {
    return;
  }
  return (
    <p>
      <strong>Gemini Tokens Used:</strong> {tokensUsed}
    </p>
  );
}

// StageResultContent displays specific parts of a StageResult.
function StageResultContentDisplay({ result }: { readonly result: StageResult }) {
  return (
    <>
      <StageResultError error={result.error} />
      <StageResultDetails details={result.details} />
      <StageResultPrompt prompt={result.prompt} />
      <StageResultRawContent rawContent={result.rawContent} />
      <StageResultJsonDisplay data={result.data} title="Data Output" />
      <StageResultJsonDisplay data={result.preparedData} title="Data Prepared for Supabase" />
      <StageResultRecordId recordId={result.recordId} />
      <StageResultTokensUsed tokensUsed={result.tokensUsed} />
      <StageResultJsonDisplay data={result.metadata} title="Metadata (Firecrawl)" />
    </>
  );
}

// Stage Result Card Component
function StageResultCard({ stageName, result }: { readonly stageName: string; readonly result?: StageResult }) {
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
        <StageResultContentDisplay result={result} />
      </CardContent>
    </Card>
  );
}

interface UrlInputProps {
  url: string;
  setUrl: (url: string) => void;
  disabled: boolean;
}

function UrlInputField({ url, setUrl, disabled }: Readonly<UrlInputProps>) {
  return (
    <div>
      <Label htmlFor="url-input">URL to Scrape</Label>
      <Input
        id="url-input"
        type="url"
        placeholder="https://example.com"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={disabled}
        className="mt-1"
      />
    </div>
  );
}

interface RawTextInputProps {
  rawText: string;
  setRawText: (text: string) => void;
  disabled: boolean;
}

function RawTextInputField({ rawText, setRawText, disabled }: Readonly<RawTextInputProps>) {
  return (
    <div>
      <Label htmlFor="raw-text-input">Raw Text (Markdown/HTML)</Label>
      <Textarea
        id="raw-text-input"
        placeholder="Paste Markdown or HTML content here..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        disabled={disabled}
        className="mt-1 h-40"
      />
    </div>
  );
}

interface UseRawTextCheckboxProps {
  useRawText: boolean;
  setUseRawText: (use: boolean) => void;
  disabled: boolean;
}

function UseRawTextCheckboxField({ useRawText, setUseRawText, disabled }: Readonly<UseRawTextCheckboxProps>) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="use-raw-text-checkbox"
        checked={useRawText}
        onCheckedChange={(checked: boolean) => setUseRawText(Boolean(checked))}
        disabled={disabled}
      />
      <Label htmlFor="use-raw-text-checkbox">Use Raw Text Input Instead</Label>
    </div>
  );
}


// Input fields for the TestPipelineForm
function TestPipelineInputFields({
  urlProps, rawTextProps, useRawTextProps, isLoading
}: Readonly<{
  urlProps: UrlInputProps;
  rawTextProps: RawTextInputProps;
  useRawTextProps: UseRawTextCheckboxProps;
  isLoading: boolean;
}>) {
  return (
    <>
      <UrlInputField {...urlProps} disabled={useRawTextProps.useRawText || isLoading} />
      <UseRawTextCheckboxField {...useRawTextProps} disabled={isLoading} />
      <RawTextInputField {...rawTextProps} disabled={!useRawTextProps.useRawText || isLoading} />
    </>
  );
}

// Checkbox options for the TestPipelineForm
function TestPipelineCheckboxOptions({
  isDryRun, setIsDryRun, isLoading, useRawText, rawText, url
}: Readonly<{
  isDryRun: boolean;
  setIsDryRun: (isDry: boolean) => void;
  isLoading: boolean;
  useRawText: boolean;
  rawText: string;
  url: string;
}>) {
  return (
    <>
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
    </>
  );
}


// Test Pipeline Form Component
function TestPipelineForm({
  url, setUrl, rawText, setRawText, useRawText, setUseRawText,
  isDryRun, setIsDryRun, isLoading, onSubmit
}: Readonly<{
  url: string;
  setUrl: (url: string) => void;
  rawText: string;
  setRawText: (text: string) => void;
  useRawText: boolean;
  setUseRawText: (use: boolean) => void;
  isDryRun: boolean;
  setIsDryRun: (isDry: boolean) => void;
  isLoading: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}>) {
  return (
    <Card className="mb-6">
      <div> {/* Combine Header and Content */}
        <CardHeader>
          <CardTitle>Test Data Pipeline</CardTitle>
          <CardDescription>
            Use this page to test the data scraping and processing pipeline with a specific url or
            raw text.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => onSubmit(e)}
            className="space-y-6"
          >
            <TestPipelineInputFields
            urlProps={{ url, setUrl, disabled: useRawText || isLoading }}
            rawTextProps={{ rawText, setRawText, disabled: !useRawText || isLoading }}
            useRawTextProps={{ useRawText, setUseRawText, disabled: isLoading }}
            isLoading={isLoading}
          />
          <TestPipelineCheckboxOptions
            isDryRun={isDryRun}
            setIsDryRun={setIsDryRun}
            isLoading={isLoading}
            useRawText={useRawText}
            rawText={rawText}
            url={url}
          />
          </form>
        </CardContent>
      </div>
    </Card>
  );
}

// Error Display Component
function ErrorDisplay({ error }: Readonly<{ error?: string }>) {
  if (error === undefined || error === '') return;

  return (
    <Card className="border-red-500">
      <CardHeader>
        <CardTitle className="text-red-600">Test Failed</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{error}</p>
      </CardContent>
    </Card>
  );
}

// Tab Triggers for TestResultsDisplay
function TestResultsTabsList({ results }: Readonly<{ results: TestPipelineResults }>) {
  return (
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
  );
}

// Log display for TestResultsDisplay
function TestResultsLogs({ logs }: Readonly<{ logs?: string[] }>) {
  if (logs == undefined || logs.length === 0) {
    return;
  }
  return (
    <div className="mt-4">
      <h3 className="text-lg font-semibold">Logs:</h3>
      <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-800 rounded-md overflow-x-auto text-sm">
        {logs.join('\n')}
      </pre>
    </div>
  );
}

// Test Results Display Component
function TestResultsDisplay({
  results,
  renderStageResult
}: Readonly<{
  results?: TestPipelineResults;
  renderStageResult: (stageName: string, result?: StageResult) => React.JSX.Element | undefined;
}>) {
  if (!results || results.error != undefined) return;

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
          <TestResultsTabsList results={results} />
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
        <TestResultsLogs logs={results.logs} />
      </CardContent>
    </Card>
  );
}

interface HandleTestPipelineSubmitOptions {
  event: FormEvent<HTMLFormElement>;
  useRawText: boolean;
  url: string;
  rawText: string;
  isDryRun: boolean;
  setIsLoading: (loading: boolean) => void;
  setResults: (results: TestPipelineResults | undefined) => void;
  setError: (error: string | undefined) => void;
}

function buildTestPipelinePayload(options: HandleTestPipelineSubmitOptions) {
  return {
    url: options.useRawText ? undefined : options.url,
    rawText: options.useRawText ? options.rawText : undefined,
    isDryRun: options.isDryRun,
  };
}

function processTestPipelineResponse(
  responseOk: boolean,
  data: TestPipelineResults,
  options: HandleTestPipelineSubmitOptions
) {
  if (!responseOk) {
    throw new Error(data.error ?? 'Test run failed');
  }
  options.setResults(data);
}

function handleTestPipelineError(error: unknown, options: HandleTestPipelineSubmitOptions) {
  const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
  options.setError(errorMessage);
  options.setResults({ error: errorMessage });
}

// Helper function extracted from TestPipelinePage to handle form submission
async function handleTestPipelineSubmit(options: HandleTestPipelineSubmitOptions) {
  options.event.preventDefault();
  options.setIsLoading(true);
  options.setResults(undefined);
  options.setError(undefined);

  const payload = buildTestPipelinePayload(options);

  try {
    const response = await fetch('/api/test-pipeline-run', {
      method: 'post',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await response.json() as TestPipelineResults;
    processTestPipelineResponse(response.ok, data, options);
  } catch (error_) {
    handleTestPipelineError(error_, options);
  } finally {
    options.setIsLoading(false);
  }
}

// Helper function to render stage results
function renderStageResultHelper(stageName: string, result?: StageResult) {
  return <StageResultCard stageName={stageName} result={result} />;
}

export default function TestPipelinePage() {
  const [url, setUrl] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');
  const [useRawText, setUseRawText] = useState<boolean>(false);
  const [isDryRun, setIsDryRun] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [results, setResults] = useState<TestPipelineResults | undefined>();
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleTestPipelineSubmit({
      event,
      useRawText,
      url,
      rawText,
      isDryRun,
      setIsLoading,
      setResults,
      setError,
    });
  };

  return (
    <div className="container mx-auto p-4">
      <TestPipelineForm
        url={url}
        setUrl={setUrl}
        rawText={rawText}
        setRawText={setRawText}
        useRawText={useRawText}
        setUseRawText={setUseRawText}
        isDryRun={isDryRun}
        setIsDryRun={setIsDryRun}
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />

      <ErrorDisplay error={error} />

      <TestResultsDisplay results={results} renderStageResult={renderStageResultHelper} />
    </div>
  );
}
