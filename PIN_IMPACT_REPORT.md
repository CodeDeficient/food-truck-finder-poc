# PIN Impact Report

## Associated Files
- `components/map/MapComponent.tsx`
- `components/map/TruckMarkers.tsx`
- `components/map/UserLocationMarker.tsx`
- `components/map/Map.css`
- `components/map/mapHelpers.ts`
- `components/map/MapLoadingFallback.tsx`
- `components/map/MapViewUpdater.tsx`
- Image assets under `public/leaflet/images/` (e.g., `food-truck-icon.svg`, `marker-icon.png`)

## Affected Files
- Primarily internal `components/map` files
- Some UI components that render truck data

## Notes
The `food-truck-icon.svg` asset is present and specifically used for the leaflet marker icons in the map components.
