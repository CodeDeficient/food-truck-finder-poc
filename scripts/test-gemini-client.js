import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { GeminiApiClient } from '../lib/gemini/geminiApiClient.js';

async function testGeminiClient() {
    try {
        console.log('🔍 Testing Gemini API Client...');
        
        // Test instantiation
        const client = new GeminiApiClient();
        console.log('✅ GeminiApiClient instantiated successfully');
        
        // Test basic functionality
        console.log('🧪 Testing basic request...');
        const testPrompt = 'Say hello in JSON format';
        const result = await client.makeRequest(testPrompt, { temperature: 0.1 });
        
        if (result.success) {
            console.log('✅ Basic request successful');
            console.log('📝 Response:', result.data?.substring(0, 100) + '...');
        } else {
            console.log('❌ Basic request failed:', result.error);
            console.log('📊 Error type:', result.errorType);
            console.log('🔢 Status code:', result.statusCode);
        }
        
        // Test parsing functionality
        console.log('\n🧪 Testing parsing request...');
        const jsonPrompt = 'Return a JSON object with { "name": "Test Food Truck", "type": "Mexican" }';
        const parseResult = await client.makeRequestWithParsing(
            jsonPrompt, 
            (text) => JSON.parse(text),
            { temperature: 0.1 }
        );
        
        if (parseResult.success) {
            console.log('✅ Parsing request successful');
            console.log('📝 Parsed data:', JSON.stringify(parseResult.data, null, 2));
        } else {
            console.log('❌ Parsing request failed:', parseResult.error);
        }
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        console.error('📋 Stack trace:', error.stack);
    }
}

// Run the test
if (process.argv[1].endsWith('test-gemini-client.js')) {
    testGeminiClient().catch(console.error);
}
