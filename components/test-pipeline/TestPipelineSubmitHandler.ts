import { TestPipelineResults } from '@/lib/types';

interface SubmitTestPipelineArgs {
  useRawText: boolean;
  url: string;
  rawText: string;
  isDryRun: boolean;
}

export async function submitTestPipeline({
  useRawText,
  url,
  rawText,
  isDryRun,
}: SubmitTestPipelineArgs): Promise<TestPipelineResults> {
  const payload = {
    url: useRawText ? undefined : url,
    rawText: useRawText ? rawText : undefined,
    isDryRun,
  };

  const response = await fetch('/api/test-pipeline-run', {
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as TestPipelineResults;

  if (!response.ok) {
    throw new Error(data.error ?? 'Test run failed');
  }
  return data;
}
