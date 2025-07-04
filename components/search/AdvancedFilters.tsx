'use client';

import React from 'react';
import { QuickFiltersSection } from './QuickFiltersSection';
import { CuisineTypesSection } from './CuisineTypesSection';
import { DistanceSliderSection } from './DistanceSliderSection';
import { type SearchFilters } from '../SearchFilters'; // Import SearchFilters interface

interface AdvancedFiltersProps {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
  readonly clearFilters: () => void;
  readonly cuisineTypes: readonly string[];
}

/**
 * AdvancedFilters component renders filtering sections for search functionality.
 * @example
 * AdvancedFilters({
 *   filters: {}, 
 *   setFilters: () => {}, 
 *   clearFilters: () => {}, 
 *   cuisineTypes: []
 * })
 * // returns a JSX element containing QuickFilters, CuisineTypes, and DistanceSlider sections.
 * @param {AdvancedFiltersProps} {filters, setFilters, clearFilters, cuisineTypes} - An object containing current filters, setter functions for filters, a function to clear filters, and an array of cuisine types.
 * @returns {JSX.Element} A div containing multiple filtering sections.
 * @description
 *   - Utilizes QuickFiltersSection, CuisineTypesSection, and DistanceSliderSection components to handle different filtering criteria.
 *   - Renders with added space and top padding, distinguished by a top border in dark mode.
 *   - Filters, setFilters, and cuisineTypes props are propagated to child components.
 */
export function AdvancedFilters({
  filters,
  setFilters,
  clearFilters,
  cuisineTypes,
}: AdvancedFiltersProps) {
  return (
    <div className="space-y-4 pt-4 border-t dark:border-slate-700">
      <QuickFiltersSection filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
      <CuisineTypesSection filters={filters} setFilters={setFilters} cuisineTypes={cuisineTypes} />
      <DistanceSliderSection filters={filters} setFilters={setFilters} />
    </div>
  );
}
