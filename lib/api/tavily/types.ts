export interface TavilyRequestBody {
  operation: string;
  params: Record<string, unknown>;
}

export interface TavilyResult {
  title: string;
  url: string;
  content: string;
  raw_content: string;
}
