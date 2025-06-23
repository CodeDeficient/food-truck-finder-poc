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
