#!/usr/bin/env node

/**
 * Debug URL Filtering
 * 
 * This script debugs the URL filtering logic to see why some URLs aren't being filtered.
 */

// Test the core filtering logic - matching the actual discovery engine implementation
function isObviouslyNonFoodTruckUrl(url) {
    const nonFoodTruckPatterns = [
        /\/events?\//i,
        /\/festivals?\//i,
        /\/calendar/i,
        /\/blog/i,
        /\/news/i,
        /\/articles?\//i,
        /\/government/i,
        /\/city\.gov/i,
        /\/municipal/i,
        /\/reddit\.com/i,
        /\/facebook\.com/i,
        /\/instagram\.com/i,
        /\/twitter\.com/i,
        /\/linkedin\.com/i,
        /\/youtube\.com/i,
        /\/yelp\.com/i,
        /\/google\.com\/maps/i,
        /\/foursquare\.com/i,
        /\/tripadvisor\.com/i,
        /\/zomato\.com/i,
        /\/eventbrite\.com/i,
        /\/meetup\.com/i,
    ];
    
    // Also check for blacklist keywords like the discovery engine does
    const blacklistKeywords = [
        'facebook.com',
        'instagram.com',
        'twitter.com',
        'linkedin.com',
        'youtube.com',
        'yelp.com',
        'google.com',
        'maps.google.com',
        'foursquare.com',
        'tripadvisor.com',
        'zomato.com',
        'eventbrite.com',
        'meetup.com',
    ];
    
    const urlLower = url.toLowerCase();
    
    console.log(`Testing URL: ${url}`);
    
    // Check regex patterns first
    for (const pattern of nonFoodTruckPatterns) {
        if (pattern.test(urlLower)) {
            console.log(`  ✅ Matched pattern: ${pattern}`);
            return true;
        }
    }
    
    // Check blacklist keywords like discovery engine does
    for (const keyword of blacklistKeywords) {
        if (urlLower.includes(keyword)) {
            console.log(`  ✅ Matched blacklist keyword: ${keyword}`);
            return true;
        }
    }
    
    console.log(`  ❌ No pattern or keyword matched`);
    return false;
}

const testUrls = [
    'https://www.facebook.com/foodtruck',
    'https://www.instagram.com/foodtruck',
    'https://www.eventbrite.com/food-truck-festival',
    'https://www.cityofcharleston.org/calendar',
    'https://www.reddit.com/r/foodtrucks',
    'https://www.bestfoodtruck.com',
    'https://charlestonfoodtrucks.com',
    'https://www.roaminghunger.com/charleston-food-trucks',
    'https://www.charleston.gov/news',
    'https://www.charleston.gov/events/calendar',
    'https://www.meetup.com/charleston-foodies',
];

console.log('🔍 Debugging URL Filtering...\n');

for (const url of testUrls) {
    const shouldSkip = isObviouslyNonFoodTruckUrl(url);
    const result = shouldSkip ? '⏭️  WILL SKIP' : '✅ WILL PROCESS';
    console.log(`   ${result} ${url}\n`);
}
