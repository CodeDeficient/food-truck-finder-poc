'use client';


import { type SearchFilters } from '../SearchFilters'; // Import SearchFilters interface

interface DistanceSliderSectionProps {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
}

/**
 * Renders a slider for selecting a distance radius in kilometers.
 * @example
 * DistanceSliderSection({ filters: { radius: 25 }, setFilters: someFunction })
 * <div>...</div>
 * @param {Object} filters - The current filter settings, including the radius.
 * @param {Function} setFilters - Function to update the filter settings.
 * @returns {JSX.Element} A container with a label, slider, and range indicators for distance selection.
 * @description 
 *   - The slider allows users to choose a distance between 1 km to 50 km.
 *   - Displays the currently selected radius beside the slider.
 *   - Updates the radius value using the setFilters function whenever the slider value changes.
 */
export function DistanceSliderSection({ filters, setFilters }: DistanceSliderSectionProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block dark:text-gray-100">
        Distance: {filters.radius} km
      </label>
      <input
        type="range"
        min="1"
        max="50"
        value={filters.radius}
        onChange={(e) => setFilters({ ...filters, radius: Number(e.target.value) })}
        className="w-full accent-blue-600 dark:accent-blue-500"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>1 km</span>
        <span>50 km</span>
      </div>
    </div>
  );
}
