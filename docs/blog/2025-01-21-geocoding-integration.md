# Improving Food Truck Location Data with Geocoding

**Date:** January 21, 2025  
**Author**

## The Problem

After a successful initial scraping run, we discovered an issue with our food truck data display. While we had 48-85 food trucks in our database, only 8 were showing up on the live deployment. Investigation revealed that our `isViableTruck` filter was (correctly) excluding trucks without proper location data - either valid GPS coordinates or a meaningful address.

The root cause? Many trucks scraped from listing pages only had basic state-level location data like `{"state": "SC"}`, making them invisible on our map.

## The Solution

We implemented a comprehensive geocoding solution to convert addresses into GPS coordinates:

### 1. Address Extraction
Created a sophisticated address extraction function that searches for:
- Street addresses with numbers (e.g., "123 King Street, Charleston, SC")
- Location descriptions (e.g., "located at", "find us at")
- Charleston landmarks (e.g., "Marion Square", "King Street")

### 2. Geocoding Integration
Integrated our existing Nominatim-based geocoding utility into the scraping pipeline:
- When creating trucks from listing pages, we now extract and geocode addresses
- For individual truck pages, we geocode addresses from the Gemini extraction
- Only fall back to default Charleston coordinates if geocoding fails

### 3. Data Quality Improvements
- Trucks with successfully geocoded addresses receive higher data quality scores (0.6-0.8)
- Added descriptive text indicating when location needs verification
- Updated existing trucks with missing location data

## Results

The improvements were immediate and significant:
- **Before:** Only 8 viable trucks displayed
- **After:** All 85 trucks now visible on the map
- Each truck has either:
  - Accurate GPS coordinates from geocoded addresses
  - Default Charleston area coordinates (pending verification)

## Technical Implementation

```javascript
// Extract addresses from scraped content
const potentialAddresses = extractAddresses(scrapeData.data?.markdown || '');

// Try to geocode each address
for (const addr of potentialAddresses) {
  const geocodeResult = await geocodeAddress(addr, 'Charleston, SC');
  if (geocodeResult.success) {
    location = {
      address: addr,
      lat: geocodeResult.lat,
      lng: geocodeResult.lng,
      city: 'Charleston',
      state: 'SC'
    };
    break; // Use first successful geocoding
  }
}
```

## Lessons Learned

1. **Data Quality Matters**: The viability filter was working correctly - the issue was data quality
2. **Progressive Enhancement**: Start with basic data, then enhance with geocoding
3. **Fallback Strategies**: Always have sensible defaults when external services fail
4. **Rate Limiting**: Respect geocoding API limits (1 request per second for Nominatim)

## Next Steps

1. **Address Clustering**: Resolve the issue of multiple trucks at the same location
2. **Manual Verification**: Allow food truck owners to update their exact locations
3. **Real-time Updates**: Implement location updates for trucks that move daily
4. **Enhanced Extraction**: Improve address extraction from social media profiles

## Code Quality Notes

During this work, we also:
- Fixed a syntax error in the scraper (unescaped regex character)
- Improved URL filtering to exclude irrelevant links
- Added better logging for debugging
- Created utility scripts for database maintenance

The food truck finder now displays a much more complete picture of Charleston's food truck scene, with 85 trucks visible instead of just 8. While some locations still need verification, every truck is now discoverable on the map.
