import { type NextRequest } from 'next/server';
/**
 * Processes a search request and returns filtered and sorted food trucks based on query parameters.
 * @example
 * processSearchRequest(request)
 * { trucks: [/* filtered food trucks */
export declare function processSearchRequest(request: NextRequest): Promise<any>;
