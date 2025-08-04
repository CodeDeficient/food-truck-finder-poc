#!/usr/bin/env node

import { GeminiResponseParser } from '../dist/lib/gemini/responseParser.js';

console.log('🔍 Testing Robust JSON Parsing...');

// Test cases for common Gemini JSON issues we've encountered
const testCases = [
  {
    name: 'Missing commas between properties',
    input: `{
  "name": "Taco Truck"
  "cuisine": "Mexican"
  "price": "$$"
}`,
    expected: { name: "Taco Truck", cuisine: "Mexican", price: "$$" }
  },
  {
    name: 'Missing commas between array elements',
    input: `{
  "items": [
    {"name": "Taco" "price": 3.50}
    {"name": "Burrito" "price": 6.00}
  ]
}`,
    expected: { items: [{ name: "Taco", price: 3.50 }, { name: "Burrito", price: 6.00 }] }
  },
  {
    name: 'Trailing commas',
    input: `{
  "name": "Burger Truck",
  "items": ["Burger", "Fries",]
}`,
    expected: { name: "Burger Truck", items: ["Burger", "Fries"] }
  },
  {
    name: 'Unpaired quotes',
    input: `{
  "name": "Taco Truck"
  "description": "Delicious tacos"
}`,
    expected: { name: "Taco Truck", description: "Delicious tacos" }
  },
  {
    name: 'JSON with code blocks',
    input: '```json\n{\n  "name": "Pizza Truck",\n  "cuisine": "Italian"\n}\n```',
    expected: { name: "Pizza Truck", cuisine: "Italian" }
  }
];

let passedTests = 0;
let totalTests = testCases.length;

for (const testCase of testCases) {
  try {
    console.log(`\n🧪 Test: ${testCase.name}`);
    console.log(`Input: ${JSON.stringify(testCase.input)}`);
    
    const result = GeminiResponseParser.parseJson(testCase.input);
    console.log(`✅ Parsed successfully:`, JSON.stringify(result));
    
    // Simple comparison (in real tests you'd want deep equality)
    const isMatch = JSON.stringify(result) === JSON.stringify(testCase.expected);
    if (isMatch) {
      console.log('✅ Result matches expected output');
      passedTests++;
    } else {
      console.log('❌ Result does not match expected output');
      console.log(`Expected: ${JSON.stringify(testCase.expected)}`);
    }
  } catch (error) {
    console.log(`❌ Failed to parse: ${error.message}`);
  }
}

console.log(`\n📊 Test Results: ${passedTests}/${totalTests} passed`);

if (passedTests === totalTests) {
  console.log('🎉 All JSON parsing tests passed!');
} else {
  console.log('⚠️  Some tests failed - JSON parsing needs improvement');
}
