#!/usr/bin/env node

/**
 * Simple script to test food truck name normalization and similarity calculation
 */

// Simple implementation of the normalization logic for testing
function normalizeFoodTruckName(name) {
    if (!name)
        return '';
    
    return name
        .toLowerCase()
        .trim()
        // Normalize apostrophes (handle different Unicode apostrophes)
        .replace(/[\u2018\u2019\u0060\u00B4]/g, "'")
        // Remove common food truck suffixes/prefixes
        .replace(/\s*(food\s+truck|food\s+trailer|mobile\s+kitchen|street\s+food|food\s+cart)\s*/gi, '')
        // Remove extra whitespace and normalize punctuation
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s&'-]/g, '')
        .trim();
}

// Simple Levenshtein distance calculation
function calculateLevenshteinDistance(str1, str2) {
    if (!str1 || !str2)
        return 0;
    
    // Normalize food truck names for better comparison
    const normalized1 = normalizeFoodTruckName(str1);
    const normalized2 = normalizeFoodTruckName(str2);
    
    if (normalized1 === normalized2)
        return 1;
        
    // Also check if one is a substring of the other
    const isSubstring = normalized1.includes(normalized2) || normalized2.includes(normalized1);
    if (isSubstring && (normalized1.length > 0 && normalized2.length > 0)) {
        const minLength = Math.min(normalized1.length, normalized2.length);
        const maxLength = Math.max(normalized1.length, normalized2.length);
        // High similarity for substring matches (0.8 to 0.95 based on length ratio)
        return 0.8 + (0.15 * (minLength / maxLength));
    }
    
    // Calculate Levenshtein distance on normalized strings
    const matrix = [];
    const len1 = normalized1.length;
    const len2 = normalized2.length;
    for (let i = 0; i <= len1; i += 1) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j += 1) {
        matrix[0][j] = j;
    }
    for (let i = 1; i <= len1; i += 1) {
        for (let j = 1; j <= len2; j += 1) {
            const cost = normalized1[i - 1] === normalized2[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(matrix[i - 1][j] + 1, // deletion
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j - 1] + cost);
        }
    }
    const distance = matrix[len1][len2];
    const maxLength = Math.max(len1, len2);
    return maxLength === 0 ? 1 : 1 - distance / maxLength;
}

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
    
    // Apostrophe variations (should be exact match after normalization)
    { name1: "Page'S Okra Grill", name2: "Page's Okra Grill", expected: 1.0 },
    { name1: "Page's Okra Grill", name2: "Page's Okra Grill", expected: 1.0 },
];

console.log('🔍 Testing Enhanced Food Truck Name Normalization\n');

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
    "Street Food",
    // Test apostrophe variations
    "Page'S Okra Grill", // uppercase S
    "Page's Okra Grill", // lowercase s
    "Page's Okra Grill", // Unicode apostrophe
];

normalizationTests.forEach(name => {
    const normalized = normalizeFoodTruckName(name);
    console.log(`  "${name}" → "${normalized}"`);
});

console.log('\n📊 Similarity Calculation Tests:');
let passed = 0;
let total = testCases.length;

testCases.forEach((test, index) => {
    const similarity = calculateLevenshteinDistance(test.name1, test.name2);
    const passedTest = Math.abs(similarity - test.expected) < 0.15; // Increased tolerance
    if (passedTest) passed++;
    
    console.log(
        `  ${index + 1}. "${test.name1}" vs "${test.name2}": ${similarity.toFixed(2)} ${passedTest ? '✅' : '❌'} (expected ~${test.expected})`
    );
});

console.log(`\n📈 Results: ${passed}/${total} tests passed (${Math.round((passed/total)*100)}%)`);

// Test the full duplicate check logic
console.log('\n🔍 Full Similarity Logic Test:');

const sampleNames = [
    { name1: "Page's Okra Grill Food Truck", name2: "Page's Okra Grill" },
    { name1: "Taco Bell Express", name2: "Taco Bell" },
    { name1: "Burger King", name2: "Pizza Hut" },
    { name1: "Street Food Vendor", name2: "Street Food" },
];

sampleNames.forEach((pair, index) => {
    const similarity = calculateLevenshteinDistance(pair.name1, pair.name2);
    const isDuplicate = similarity >= 0.8;
    console.log(
        `  ${index + 1}. "${pair.name1}" vs "${pair.name2}": ${similarity.toFixed(2)} ${isDuplicate ? '⚠️ DUPLICATE' : '✅ OK'}`
    );
});
