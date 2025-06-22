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

import * as React from 'react';
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
import { StageResultCard } from '@/components/test-pipeline/StageResultCard';
import { TestPipelineForm } from '@/components/test-pipeline/TestPipelineForm';
import { ErrorDisplay } from '@/components/test-pipeline/ErrorDisplay';
import { TestResultsDisplay } from '@/components/test-pipeline/TestResultsDisplay';

// Helper function extracted from TestPipelinePage to handle form submission
async function handleTestPipelineSubmit(
  event: FormEvent<HTMLFormElement>,
  useRawText: boolean,
  url: string,
  rawText: string,
  isDryRun: boolean,
  setIsLoading: (loading: boolean) => void,
  setResults: (results: TestPipelineResults | undefined) => void,
  setError: (error: string | undefined) => void
) {
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
    void handleTestPipelineSubmit(
      event,
      useRawText,
      url,
      rawText,
      isDryRun,
      setIsLoading,
      setResults,
      setError
    );
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
