import * as React from 'react';
import { Textarea } from '@/components/ui/textarea';
import type { StageResult } from '@/lib/types';

interface StageResultDetailsProps {
  readonly result: StageResult;
}

const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
  <p className="text-red-500">
    <strong>Error:</strong> {error}
  </p>
);

const DetailsDisplay: React.FC<{ details: string }> = ({ details }) => (
  <p>
    <strong>Details:</strong> {details}
  </p>
);

const PromptDisplay: React.FC<{ prompt: string }> = ({ prompt }) => (
  <div>
    <strong>Prompt:</strong>
    <Textarea readOnly value={prompt} className="mt-1 h-32 bg-gray-50 dark:bg-slate-700" />
  </div>
);

const RawContentDisplay: React.FC<{ rawContent: string }> = ({ rawContent }) => (
  <div>
    <strong>Raw Content (Firecrawl):</strong>
    <Textarea readOnly value={rawContent} className="mt-1 h-48 bg-gray-50 dark:bg-slate-700" />
  </div>
);

const DataOutputDisplay: React.FC<{ data: unknown }> = ({ data }) => (
  <div className="mt-2">
    <strong>Data Output:</strong>{' '}
    <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
      {JSON.stringify(data, undefined, 2)}
    </pre>
  </div>
);

const PreparedDataDisplay: React.FC<{ preparedData: unknown }> = ({ preparedData }) => (
  <div className="mt-2">
    <strong>Data Prepared for Supabase:</strong>{' '}
    <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
      {JSON.stringify(preparedData, undefined, 2)}
    </pre>
  </div>
);

const RecordIdDisplay: React.FC<{ recordId: string }> = ({ recordId }) => (
  <p>
    <strong>Supabase Record id:</strong> {recordId}
  </p>
);

const TokensUsedDisplay: React.FC<{ tokensUsed: number }> = ({ tokensUsed }) => (
  <p>
    <strong>Gemini Tokens Used:</strong> {tokensUsed}
  </p>
);

const MetadataDisplay: React.FC<{ metadata: unknown }> = ({ metadata }) => (
  <div>
    <strong>Metadata (Firecrawl):</strong>{' '}
    <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-700 rounded-md overflow-x-auto text-sm">
      {JSON.stringify(metadata, undefined, 2)}
    </pre>
  </div>
);

export function StageResultDetails({ result }: Readonly<StageResultDetailsProps>) {
  return (
    <>
      {result.error !== undefined && <ErrorDisplay error={result.error} />}
      {result.details !== undefined && <DetailsDisplay details={result.details} />}
      {result.prompt !== undefined && <PromptDisplay prompt={result.prompt} />}
      {result.rawContent !== undefined && <RawContentDisplay rawContent={result.rawContent} />}
      {result.data !== undefined && <DataOutputDisplay data={result.data} />}
      {result.preparedData !== undefined && (
        <PreparedDataDisplay preparedData={result.preparedData} />
      )}
      {result.recordId !== undefined && <RecordIdDisplay recordId={result.recordId} />}
      {result.tokensUsed !== undefined && <TokensUsedDisplay tokensUsed={result.tokensUsed} />}
      {result.metadata !== undefined && <MetadataDisplay metadata={result.metadata} />}
    </>
  );
}
