// Test script for Enhanced Pipeline
// This script tests the enhanced pipeline components without requiring a full database setup

const { enhancedPipelineOrchestrator } = require('./lib/enhancedPipelineOrchestrator');

async function testEnhancedPipeline() {
  console.log('🧪 Testing Enhanced Pipeline Components...\n');

  try {
    // Test 1: Discovery Phase Only
    console.log('📍 Test 1: Location-specific discovery for Charleston...');
    const discoveryResult = await enhancedPipelineOrchestrator.runCompletePipeline({
      action: 'discovery-only',
      targetCities: ['Charleston'],
      maxUrlsToDiscover: 5,
      maxUrlsToProcess: 0,
      skipDiscovery: false,
    });

    console.log('Discovery Result:', JSON.stringify(discoveryResult, null, 2));

    // Test 2: Processing Phase Only (if we have URLs)
    console.log('\n⚙️ Test 2: Processing existing URLs...');
    const processingResult = await enhancedPipelineOrchestrator.runCompletePipeline({
      action: 'processing-only',
      maxUrlsToProcess: 3,
      skipDiscovery: true,
    });

    console.log('Processing Result:', JSON.stringify(processingResult, null, 2));

    console.log('\n✅ Enhanced Pipeline tests completed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
if (require.main === module) {
  testEnhancedPipeline();
}

module.exports = { testEnhancedPipeline };
