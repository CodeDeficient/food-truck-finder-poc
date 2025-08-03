#!/usr/bin/env node

/**
 * Script to test the enhanced duplicate prevention system
 */

import { DuplicatePreventionService } from '../lib/data-quality/duplicatePrevention.js';

// Test cases for food truck name normalization
const testCases = [
    // Exact matches
    { name1: "Page's Okra Grill", name2: "Page's Okra Grill", expected: 1.0 },
    
    // Food truck suffix variations
    { name1: "Page's Okra Grill", name2: "Page's Okra Grill Food Truck", expected: 0.9 },
    { name1: "Taco Bell", name2: "Taco Bell Food Trailer", expected: 0.9 },
    { name1: "Burger King Mobile", name2: "Burger King Mobile Kitchen", expected: 0.9 },
    
    // Case variations
    { name1: "Page's Okra Grill", name2: "PAGE'S OKRA GRILL", expected: 1.0 },
    { name1: "Taco Bell", name2: "taco bell", expected: 1.0 },
    
    // Punctuation variations
    { name1: "Page's Okra Grill", name2: "Pages Okra Grill", expected: 0.9 },
    { name1: "Taco & Burrito", name2: "Taco and Burrito", expected: 0.9 },
    
    // Substring matches
    { name1: "Page's Okra Grill Food Truck", name2: "Page's Okra Grill", expected: 0.9 },
    { name1: "Taco Bell Express", name2: "Taco Bell", expected: 0.9 },
    
    // Different names (should be low similarity)
    { name1: "Page's Okra Grill", name2: "Taco Bell", expected: 0.0 },
    { name1: "Burger King", name2: "Pizza Hut", expected: 0.0 },
];

console.log('🔍 Testing Enhanced Duplicate Prevention System\n');

// Test name normalization
console.log('🧪 Name Normalization Tests:');
const normalizationTests = [
    "Page's Okra Grill",
    "Page's Okra Grill Food Truck",
    "Taco Bell Food Trailer",
    "Burger King Mobile Kitchen",
    "Street Food Vendor",
    "PAGE'S OKRA GRILL",
    "Pages Okra Grill!",
];

normalizationTests.forEach(name => {
    const normalized = DuplicatePreventionService.normalizeFoodTruckName(name);
    console.log(`  "${name}" → "${normalized}"`);
});

console.log('\n📊 Similarity Calculation Tests:');
let passed = 0;
let total = testCases.length;

testCases.forEach((test, index) => {
    const similarity = DuplicatePreventionService.calculateStringSimilarity(test.name1, test.name2);
    const passedTest = Math.abs(similarity - test.expected) < 0.1;
    if (passedTest) passed++;
    
    console.log(
        `  ${index + 1}. "${test.name1}" vs "${test.name2}": ${similarity.toFixed(2)} ${passedTest ? '✅' : '❌'} (expected ~${test.expected})`
    );
});

console.log(`\n📈 Results: ${passed}/${total} tests passed (${Math.round((passed/total)*100)}%)`);

// Test the full duplicate check with sample data
console.log('\n🔍 Full Duplicate Check Test:');

const sampleCandidate = {
    name: "Page's Okra Grill Food Truck",
    current_location: {
        address: "123 Main St, Charleston, SC",
        lat: 32.7765,
        lng: -79.9311
    },
    contact_info: {
        phone: "843-555-1234",
        website: "https://pagesokragrill.com"
    }
};

const sampleExisting = {
    name: "Page's Okra Grill",
    current_location: {
        address: "123 Main Street, Charleston, SC",
        lat: 32.7766,
        lng: -79.9310
    },
    contact_info: {
        phone: "843-555-1234",
        website: "https://pagesokragrill.com"
    }
};

console.log('\n📋 Sample Candidate Truck:');
console.log(`  Name: ${sampleCandidate.name}`);
console.log(`  Location: ${sampleCandidate.current_location.address}`);
console.log(`  Phone: ${sampleCandidate.contact_info.phone}`);

console.log('\n📋 Sample Existing Truck:');
console.log(`  Name: ${sampleExisting.name}`);
console.log(`  Location: ${sampleExisting.current_location.address}`);
console.log(`  Phone: ${sampleExisting.contact_info.phone}`);

const similarity = DuplicatePreventionService.calculateSimilarity(sampleCandidate, sampleExisting);
console.log('\n📊 Similarity Analysis:');
console.log(`  Overall: ${(similarity.overall * 100).toFixed(1)}%`);
console.log(`  Name: ${(similarity.breakdown.name * 100).toFixed(1)}%`);
console.log(`  Location: ${(similarity.breakdown.location * 100).toFixed(1)}%`);
console.log(`  Contact: ${(similarity.breakdown.contact * 100).toFixed(1)}%`);
console.log(`  Matched Fields: ${similarity.matchedFields.join(', ')}`);

const isDuplicate = similarity.overall >= 0.8;
console.log(`\n🎯 Duplicate Detection: ${isDuplicate ? 'LIKELY DUPLICATE' : 'NOT A DUPLICATE'} ${isDuplicate ? '⚠️' : '✅'}`);
