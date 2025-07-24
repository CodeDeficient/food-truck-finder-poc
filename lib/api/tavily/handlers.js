/**
 * Sends a search query to the Tavily API and retrieves results.
 * @example
 * callTavilySearchApi('your_api_key', { query: 'example search', limit: 5 })
 * Returns an object containing a list of search results including titles and URLs.
 * @param {string} apiKey - The API key used for authorization with the Tavily API.
 * @param {Record<string, unknown>} params - An object containing search parameters such as the query and limits.
 * @returns {Object} An object containing search results with titles, URLs, and content.
 * @description
 *   - Uses fetch API to send a POST request to Tavily's search endpoint.
 *   - Automatically includes relevant headers for JSON content type and authorization.
 *   - Provides default values for certain parameters (e.g., max_results and search_depth).
 *   - Maps and structures the results before returning them to ensure consistency in the returned format.
 */
async function callTavilySearchApi(apiKey, params) {
    const response = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
            query: params.query ?? params.q,
            max_results: params.limit ?? 10,
            search_depth: params.search_depth ?? 'advanced',
            include_answer: true,
            include_raw_content: true,
        }),
    });
    if (!response.ok) {
        const errorText = await response.text();
        console.error('Tavily API error response:', errorText);
        throw new Error(`Tavily API error: ${response.status} ${response.statusText} - ${errorText}`);
    }
    const data = (await response.json());
    return {
        results: data.results?.map((result) => ({
            title: result.title,
            url: result.url,
            content: result.content,
            raw_content: result.raw_content,
        })) ?? [],
    };
}
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
export async function performTavilySearch(params) {
    const apiKey = process.env.TAVILY_API_KEY;
    if (apiKey === undefined || apiKey === '') {
        console.warn('TAVILY_API_KEY not found, using mock data');
        return {
            results: [
                {
                    title: 'South Carolina Food Trucks (Mock)',
                    url: 'https://example-foodtruck1.com',
                    content: 'Check out the best food trucks in South Carolina. Visit https://carolinabbq.com for amazing BBQ on wheels.',
                    raw_content: 'Carolina BBQ Food Truck serves authentic South Carolina barbecue...',
                },
                {
                    title: 'Charleston Mobile Food Directory (Mock)',
                    url: 'https://example-directory.com',
                    content: 'Directory of Charleston area food trucks including https://charlestontacos.com and https://lowcountryeats.com',
                    raw_content: 'Complete listing of mobile food vendors in the Charleston area...',
                },
            ],
        };
    }
    try {
        return await callTavilySearchApi(apiKey, params);
    }
    catch (error) {
        console.error('Tavily API call failed:', error);
        throw error;
    }
}
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
export function performTavilyCrawl(params) {
    console.info('Mock Tavily crawl with params:', params);
    return {
        results: [
            {
                url: 'https://example-crawled-truck.com',
                title: 'Gourmet Food Truck',
                content: 'Premium mobile dining experience...',
            },
        ],
    };
}
export function performTavilyMap(params) {
    console.info('Mock Tavily map with params:', params);
    return {
        results: ['https://foodtruckdirectory.com/truck1', 'https://foodtruckdirectory.com/truck2'],
    };
}
