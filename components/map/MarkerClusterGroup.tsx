'use client';

import { createPathComponent } from '@react-leaflet/core';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface MarkerClusterGroupProps {
  children?: React.ReactNode;
  maxClusterRadius?: number;
  iconCreateFunction?: (cluster: any) => L.DivIcon;
  spiderfyOnMaxZoom?: boolean;
  showCoverageOnHover?: boolean;
  zoomToBoundsOnClick?: boolean;
  disableClusteringAtZoom?: number;
  removeOutsideVisibleBounds?: boolean;
  animate?: boolean;
  animateAddingMarkers?: boolean;
  maxZoom?: number;
}

const createMarkerClusterGroup = (props: MarkerClusterGroupProps, context: any) => {
  // Create cluster group with options
  const {
    maxClusterRadius = 80,
    iconCreateFunction,
    spiderfyOnMaxZoom = true,
    showCoverageOnHover = true,
    zoomToBoundsOnClick = true,
    disableClusteringAtZoom,
    removeOutsideVisibleBounds = true,
    animate = true,
    animateAddingMarkers = true,
    maxZoom = 18,
  } = props;

  const options: any = {
    maxClusterRadius,
    spiderfyOnMaxZoom,
    showCoverageOnHover,
    zoomToBoundsOnClick,
    removeOutsideVisibleBounds,
    animate,
    animateAddingMarkers,
    maxZoom,
  };

  if (disableClusteringAtZoom !== undefined) {
    options.disableClusteringAtZoom = disableClusteringAtZoom;
  }

  if (iconCreateFunction) {
    options.iconCreateFunction = iconCreateFunction;
  }

  const instance = L.markerClusterGroup(options);
  
  return {
    instance,
    context: {
      ...context,
      layerContainer: instance,
    },
  };
};

const MarkerClusterGroup = createPathComponent<
  L.MarkerClusterGroup,
  MarkerClusterGroupProps
>(createMarkerClusterGroup);

export default MarkerClusterGroup;
export type { MarkerClusterGroupProps };
