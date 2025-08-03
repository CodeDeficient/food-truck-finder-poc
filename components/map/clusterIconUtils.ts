import L from 'leaflet';
import type { FoodTruck } from '@/lib/types';
import { isTruckOpen } from '@/lib/utils/foodTruckHelpers';

/**
 * Creates a custom cluster icon based on the trucks in the cluster
 * Uses the project's pin palette (green for open, red for closed)
 */
export const createClusterIcon = (cluster: any): L.DivIcon => {
  const childCount = cluster.getChildCount();
  const markers = cluster.getAllChildMarkers();
  
  // Analyze the markers to determine cluster state
  let openCount = 0;
  let closedCount = 0;
  
  markers.forEach((marker: any) => {
    if (marker.options?.truck) {
      const truck: FoodTruck = marker.options.truck;
      if (isTruckOpen(truck)) {
        openCount++;
      } else {
        closedCount++;
      }
    }
  });
  
  // Determine cluster size class
  let sizeClass = 'marker-cluster-small';
  if (childCount >= 100) {
    sizeClass = 'marker-cluster-large';
  } else if (childCount >= 10) {
    sizeClass = 'marker-cluster-medium';
  }
  
  // Determine cluster state class
  let stateClass = '';
  if (openCount > 0 && closedCount > 0) {
    stateClass = 'marker-cluster-mixed';
  } else if (openCount > closedCount) {
    stateClass = sizeClass; // Use the green color scheme
  } else {
    stateClass = sizeClass; // Default to green, could add red variation if needed
  }
  
  // Size based on count
  let iconSize = [40, 40];
  if (childCount >= 100) {
    iconSize = [60, 60];
  } else if (childCount >= 10) {
    iconSize = [50, 50];
  }
  
  return L.divIcon({
    html: `<div class="${stateClass}"><span>${childCount}</span></div>`,
    className: 'marker-cluster-custom',
    iconSize: iconSize as [number, number],
    iconAnchor: [iconSize[0] / 2, iconSize[1] / 2],
  });
};

/**
 * Default cluster options with custom styling
 */
export const getDefaultClusterOptions = (maxClusterRadius = 80) => ({
  maxClusterRadius,
  iconCreateFunction: createClusterIcon,
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  removeOutsideVisibleBounds: true,
  animate: true,
  animateAddingMarkers: true,
  maxZoom: 18,
});
