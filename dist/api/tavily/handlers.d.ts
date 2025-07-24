/**
 * Performs a search operation using Tavily API or returns mock data if API key is unavailable.
 * @example
 * performTavilySearch({ location: 'South Carolina', query: 'food trucks' })
 * { results: [{ title: 'South Carolina Food Trucks (Mock)', url: 'https://example-foodtruck1.com', ... }] }
 * @param {Record<string, unknown>} params - Parameters for the Tavily API search.
 * @returns {Promise<any>} The search results from the Tavily API or mock data.
 * @description
 *   - Utilizes the TAVILY_API_KEY from environment variables to make API requests.
 *   - Returns mock data if the API key is missing or empty.
 *   - Logs a warning if mock data is being used due to missing API key.
 *   - Throws an error if the Tavily API call fails.
 */
export declare function performTavilySearch(params: Record<string, unknown>): Promise<{
    results: {
        title: any;
        url: any;
        content: any;
        raw_content: any;
    }[];
}>;
/**
* Performs a mock Tavily crawl operation.
* @example
* performTavilyCrawl({ key: 'value' })
* { results: [ { url: 'https://example-crawled-truck.com', title: 'Gourmet Food Truck', content: 'Premium mobile dining experience...' } ] }
* @param {Record<string, unknown>} params - Parameters for the mock crawl operation.
* @returns {Object} An object containing mock crawl results.
* @description
*   - Utilizes a mock implementation for demonstration purposes.
*   - Logs the crawling parameters to the console for debugging.
*/
export declare function performTavilyCrawl(params: Record<string, unknown>): {
    results: {
        url: string;
        title: string;
        content: string;
    }[];
};
export declare function performTavilyMap(params: Record<string, unknown>): {
    results: string[];
};
