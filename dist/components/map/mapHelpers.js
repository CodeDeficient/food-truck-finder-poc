export function getInitialMapCenter(userLocation, defaultCenter) {
    return userLocation &&
        typeof userLocation.lat === 'number' &&
        typeof userLocation.lng === 'number'
        ? [userLocation.lat, userLocation.lng]
        : defaultCenter;
}
