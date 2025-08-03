
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useState, useRef } from 'react';

interface TruckMarkersProps {
  readonly trucks: Array<{
    id: string;
    name: string;
    current_location: {
      lat?: number;
      lng?: number;
      address?: string;
    };
    is_open?: boolean;
    is_selected?: boolean;
  }>;
  readonly onSelectTruck?: (truckId: string) => void;
  readonly selectedTruckId?: string;
}

// Pin state classes helper
const getPinStateClasses = (truck: { id: string; is_open?: boolean; is_selected?: boolean }, selectedTruckId?: string) => {
  const classes = ['food-truck-marker-icon'];
  
  // Default state
  classes.push('pin--default');
  
  // Active state (open food trucks)
  if (truck.is_open) {
    classes.push('pin--active');
  }
  
  // Selected state (either by prop or by selectedTruckId)
  if (truck.is_selected || truck.id === selectedTruckId) {
    classes.push('pin--selected');
  }
  
  return classes.join(' ');
};

// Custom food truck icon factory with state variations
const createFoodTruckIcon = (truck: { id: string; is_open?: boolean; is_selected?: boolean }, selectedTruckId?: string) => {
  return new L.Icon({
    iconUrl: '/food-truck-icon.svg',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
    className: getPinStateClasses(truck, selectedTruckId),
  });
};

// JS helpers for toggling classes
export const pinStateHelpers = {
  toggleClass: (element: HTMLElement, className: string) => {
    element.classList.toggle(className);
  },
  
  addClass: (element: HTMLElement, className: string) => {
    element.classList.add(className);
  },
  
  removeClass: (element: HTMLElement, className: string) => {
    element.classList.remove(className);
  },
  
  handleMouseOver: (element: HTMLElement) => {
    // Hover effects are handled via CSS :hover pseudo-class
    // This function can be used for additional JS-based hover logic if needed
    element.setAttribute('data-hovering', 'true');
  },
  
  handleMouseOut: (element: HTMLElement) => {
    element.removeAttribute('data-hovering');
  },
  
  handleFocus: (element: HTMLElement) => {
    // Focus effects are handled via CSS :focus pseudo-class
    element.setAttribute('data-focused', 'true');
  },
  
  handleBlur: (element: HTMLElement) => {
    element.removeAttribute('data-focused');
  },
  
  handleClick: (element: HTMLElement, isSelected: boolean) => {
    if (isSelected) {
      element.classList.add('pin--selected');
    } else {
      element.classList.remove('pin--selected');
    }
  }
};

/**
* Renders map markers for trucks with valid locations and handles click events.
* Supports pin state variations: default, hover, selected, and status (open/closed).
* @example
* TruckMarkers({ trucks: arrayOfTrucks, onSelectTruck: handleTruckSelect, selectedTruckId: 'truck-123' })
* Returns JSX elements rendering markers on a map for valid trucks with state-based styling.
* @param {Array} {trucks} - An array of truck objects to be processed.
* @param {Function} {onSelectTruck} - A callback function to handle truck selection via clicks.
* @param {string} {selectedTruckId} - ID of the currently selected truck for highlighting.
* @returns {JSX.Element} A JSX fragment containing map markers for trucks.
* @description
*   - Filters trucks to only include those with defined current locations and valid latitude and longitude values.
*   - Uses dynamic icon creation with state-based CSS classes for visual feedback.
*   - Supports pin states: default, active (open), selected, with hover and focus interactions.
*   - Implements JS helpers for class manipulation and state management.
*   - Ensures that clicking on a marker triggers the provided `onSelectTruck` function with the truck's ID.
*   - Displays a popup with the truck's name, address, and status if available, upon clicking the marker.
*/
const TruckMarkers: React.FC<TruckMarkersProps> = ({ trucks, onSelectTruck, selectedTruckId }) => {
  const markerRefs = useRef<Map<string, L.Marker>>(new Map());
  
  const validTrucks = trucks.filter(
    (truck) =>
      truck.current_location != undefined &&
      typeof truck.current_location.lat === 'number' &&
      typeof truck.current_location.lng === 'number',
  );

  return (
    <>
      {validTrucks.map((truck) => {
        const icon = createFoodTruckIcon(truck, selectedTruckId);
        
        return (
          <Marker
            key={truck.id}
            position={[truck.current_location.lat!, truck.current_location.lng!]}
            icon={icon}
            ref={(ref) => {
              if (ref) {
                markerRefs.current.set(truck.id, ref);
              } else {
                markerRefs.current.delete(truck.id);
              }
            }}
            eventHandlers={{
              click: () => {
                if (onSelectTruck) {
                  onSelectTruck(truck.id);
                }
                
                // Handle click state change via JS helper
                const markerElement = markerRefs.current.get(truck.id)?.getElement();
                if (markerElement) {
                  pinStateHelpers.handleClick(markerElement, truck.id === selectedTruckId);
                }
              },
              mouseover: () => {
                const markerElement = markerRefs.current.get(truck.id)?.getElement();
                if (markerElement) {
                  pinStateHelpers.handleMouseOver(markerElement);
                }
              },
              mouseout: () => {
                const markerElement = markerRefs.current.get(truck.id)?.getElement();
                if (markerElement) {
                  pinStateHelpers.handleMouseOut(markerElement);
                }
              },
            }}
          >
            <Popup>
              <h4 className="font-bold">{truck.name}</h4>
              {truck.current_location.address != undefined &&
                truck.current_location.address != '' && <div>{truck.current_location.address}</div>}
              {truck.is_open !== undefined && (
                <div className={truck.is_open ? 'text-green-600' : 'text-red-600'}>
                  {truck.is_open ? 'Open' : 'Closed'}
                </div>
              )}
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

export default TruckMarkers;
