export interface FirecrawlRequestBody {
    operation: string;
    url?: string;
    query?: string;
    options?: Record<string, unknown>;
}
