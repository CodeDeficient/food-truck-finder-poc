import * as React from 'react';
import { FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface TestPipelineFormProps {
  readonly url: string;
  readonly setUrl: (url: string) => void;
  readonly rawText: string;
  readonly setRawText: (text: string) => void;
  readonly useRawText: boolean;
  readonly setUseRawText: (use: boolean) => void;
  readonly isDryRun: boolean;
  readonly setIsDryRun: (isDry: boolean) => void;
  readonly isLoading: boolean;
  readonly onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

export function TestPipelineForm({
  url, setUrl, rawText, setRawText, useRawText, setUseRawText,
  isDryRun, setIsDryRun, isLoading, onSubmit
}: Readonly<TestPipelineFormProps>) {
  return (
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
            onSubmit(e);
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
  );
}
