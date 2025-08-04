#!/usr/bin/env node

/**
 * Debug Gemini Responses Script
 * 
 * This script tests the Gemini API with the same URLs that are failing
 * to see what the actual responses look like.
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { FirecrawlService } from '../lib/firecrawl.js';
import { gemini } from '../lib/gemini.js';

async function debugGeminiResponses() {
    console.log('🔍 Debugging Gemini Responses...');
    
    // Test URLs that were failing
    const testUrls = [
        'https://www.greenvilleonline.com/story/news/local/2021/06/15/food-trucks-greenville-and-across-upstate-south-carolina/7659669002/',
        'https://www.gratefulbrewgvl.com/food-trucks',
        'https://www.greenvillesc.gov/329/Food-Trucks-Trailers'
    ];
    
    for (const url of testUrls) {
        console.log(`\n--- Testing URL: ${url} ---`);
        
        try {
            // Scrape the content
            console.log('📄 Scraping content...');
            const scrapeResult = await FirecrawlService.scrapeFoodTruckWebsite(url);
            
            if (!scrapeResult.success || !scrapeResult.data?.markdown) {
                console.log('❌ Scraping failed:', scrapeResult.error ?? 'No markdown content');
                continue;
            }
            
            console.log('✅ Scraping successful, length:', scrapeResult.data.markdown.length);
            
            // Test Gemini extraction and capture raw response
            console.log('🤖 Testing Gemini extraction...');
            
            // Get the raw response first
            const rawResponse = await gemini.client.makeRequest(
                gemini.promptTemplates.foodTruckExtraction(scrapeResult.data.markdown, url),
                { temperature: 0 }
            );
            
            console.log('Raw Gemini Response:', JSON.stringify(rawResponse, null, 2));
            
            if (rawResponse.success && rawResponse.data) {
                console.log('Raw response data length:', rawResponse.data.length);
                console.log('First 500 chars:', rawResponse.data.substring(0, 500) + '...');
                
                // Try to parse it
                try {
                    const parsed = JSON.parse(rawResponse.data);
                    console.log('Parsed JSON:', JSON.stringify(parsed, null, 2));
                } catch (parseError) {
                    console.log('❌ JSON Parse Error:', parseError.message);
                }
            }
            
        } catch (error) {
            console.error('💥 Error:', error);
        }
        
        // Wait between tests
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log('\n✅ Debug completed');
}

// Run the debug
if (process.argv[1].endsWith('debug-gemini-responses.js')) {
    debugGeminiResponses().catch(console.error);
}
