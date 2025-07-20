#!/usr/bin/env node

// Clear cached food truck data from localStorage
// This is useful when you want to force fresh data from Supabase

console.log('🧹 Clearing cached food truck data...');

// This script is designed to be run in the browser console or as a bookmarklet
// Since localStorage is only available in the browser, we'll provide instructions

const clearCacheInstructions = `
To clear the cached food truck data:

1. Open your localhost site in the browser
2. Open Developer Tools (F12 or Ctrl+Shift+I)
3. Go to the Console tab
4. Run this command:

localStorage.removeItem('food-trucks-cache');
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('food-truck-')) {
    localStorage.removeItem(key);
  }
});
console.log('✅ Cache cleared! Refresh the page to fetch fresh data.');

Alternatively, you can:
- Go to Application/Storage tab in DevTools
- Expand "Local Storage" 
- Click on your localhost URL
- Delete the keys:
  * food-trucks-cache
  * Any keys starting with "food-truck-"

Then refresh the page to fetch fresh data from Supabase.
`;

console.log(clearCacheInstructions);

// If running in Node.js environment, we can't access localStorage
// But we can provide the browser-executable code
if (typeof window === 'undefined') {
  console.log('\n📋 Browser console code to copy/paste:');
  console.log(`
localStorage.removeItem('food-trucks-cache');
Object.keys(localStorage).forEach(key => {
  if (key.startsWith('food-truck-')) {
    localStorage.removeItem(key);
  }
});
console.log('✅ Cache cleared! Refresh the page.');
  `);
}
