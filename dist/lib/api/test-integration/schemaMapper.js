export function mapExtractedDataToTruckSchema(extractedData, sourceUrl, isDryRun) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p;
    if (!extractedData || typeof extractedData !== 'object') {
        throw new Error('Invalid extractedData for mapping.');
    }
    const name = (_a = extractedData.name) !== null && _a !== void 0 ? _a : 'Unknown Test Truck';
    const locationData = (_b = extractedData.current_location) !== null && _b !== void 0 ? _b : {};
    const fullAddress = [
        locationData.address,
        locationData.city,
        locationData.state,
        locationData.zip_code,
    ]
        .filter(Boolean)
        .join(', ');
    return Object.assign({ name: name, description: (_c = extractedData.description) !== null && _c !== void 0 ? _c : undefined, current_location: {
            lat: (_d = locationData.lat) !== null && _d !== void 0 ? _d : 0,
            lng: (_e = locationData.lng) !== null && _e !== void 0 ? _e : 0,
            address: (_f = fullAddress !== null && fullAddress !== void 0 ? fullAddress : locationData.raw_text) !== null && _f !== void 0 ? _f : undefined,
            timestamp: new Date().toISOString(),
        }, scheduled_locations: (_g = extractedData.scheduled_locations) !== null && _g !== void 0 ? _g : undefined, operating_hours: (_h = extractedData.operating_hours) !== null && _h !== void 0 ? _h : undefined, menu: ((_j = extractedData.menu) !== null && _j !== void 0 ? _j : []).map((category) => {
            var _a, _b;
            return ({
                name: (_a = category.name) !== null && _a !== void 0 ? _a : 'Uncategorized',
                items: ((_b = category.items) !== null && _b !== void 0 ? _b : []).map((item) => {
                    var _a, _b, _c;
                    return ({
                        name: (_a = item.name) !== null && _a !== void 0 ? _a : 'Unknown Item',
                        description: (_b = item.description) !== null && _b !== void 0 ? _b : undefined,
                        price: typeof item.price === 'number' || typeof item.price === 'string' ? item.price : undefined,
                        dietary_tags: (_c = item.dietary_tags) !== null && _c !== void 0 ? _c : [],
                    });
                }),
            });
        }), contact_info: (_k = extractedData.contact_info) !== null && _k !== void 0 ? _k : undefined, social_media: (_l = extractedData.social_media) !== null && _l !== void 0 ? _l : undefined, cuisine_type: (_m = extractedData.cuisine_type) !== null && _m !== void 0 ? _m : [], price_range: (_o = extractedData.price_range) !== null && _o !== void 0 ? _o : undefined, specialties: (_p = extractedData.specialties) !== null && _p !== void 0 ? _p : [], data_quality_score: isDryRun ? 0.5 : 0.6, verification_status: 'pending', source_urls: [sourceUrl].filter(Boolean), last_scraped_at: new Date().toISOString() }, (isDryRun && { test_run_flag: true }));
}
