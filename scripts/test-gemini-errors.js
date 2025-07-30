import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { GeminiApiClient } from '../lib/gemini/geminiApiClient.js';

async function testGeminiErrorHandling() {
    try {
        console.log('🔍 Testing Gemini API Error Handling...');
        
        const client = new GeminiApiClient();
        console.log('✅ GeminiApiClient instantiated successfully');
        
        // Test 1: Invalid API key simulation (we'll use a prompt that should cause issues)
        console.log('\n🧪 Test 1: Testing retry logic with problematic prompt...');
        const problematicPrompt = 'This is a very short prompt that might cause issues'; // This should work fine
        
        const result = await client.makeRequest(problematicPrompt, { 
            temperature: 0.1,
            maxRetries: 2,
            baseDelay: 500
        });
        
        if (result.success) {
            console.log('✅ Request completed successfully');
            console.log('📝 Response length:', result.data?.length ?? 0);
        } else {
            console.log('❌ Request failed after retries:');
            console.log('   Error:', result.error);
            console.log('   Error type:', result.errorType);
            console.log('   Status code:', result.statusCode);
        }
        
        // Test 2: Test parsing with invalid JSON
        console.log('\n🧪 Test 2: Testing JSON parsing error handling...');
        const invalidJsonPrompt = 'Return some text that is not valid JSON';
        const parseResult = await client.makeRequestWithParsing(
            invalidJsonPrompt,
            (text) => JSON.parse(text),
            { 
                temperature: 0.8, // Higher temperature for more varied responses
                maxRetries: 1
            }
        );
        
        if (parseResult.success) {
            console.log('✅ Parsing succeeded unexpectedly');
            console.log('📝 Parsed data:', JSON.stringify(parseResult.data, null, 2));
        } else {
            console.log('❌ Parsing failed as expected:');
            console.log('   Error:', parseResult.error);
        }
        
        // Test 3: Test with valid JSON parsing
        console.log('\n🧪 Test 3: Testing valid JSON parsing...');
        const validJsonPrompt = 'Return a JSON object: { "test": "value", "number": 42 }';
        const validParseResult = await client.makeRequestWithParsing(
            validJsonPrompt,
            (text) => JSON.parse(text),
            { temperature: 0.1 }
        );
        
        if (validParseResult.success) {
            console.log('✅ Valid parsing succeeded');
            console.log('📝 Parsed data:', JSON.stringify(validParseResult.data, null, 2));
        } else {
            console.log('❌ Valid parsing failed:');
            console.log('   Error:', validParseResult.error);
        }
        
        console.log('\n✅ All error handling tests completed');
        
    } catch (error) {
        console.error('💥 Fatal error:', error.message);
        console.error('📋 Stack trace:', error.stack);
    }
}

// Run the test
if (process.argv[1].endsWith('test-gemini-errors.js')) {
    testGeminiErrorHandling().catch(console.error);
}
