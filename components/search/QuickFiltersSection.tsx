'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { type SearchFilters } from '../SearchFilters'; // Import SearchFilters interface

interface QuickFiltersSectionProps {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
  readonly clearFilters: () => void;
}

/**
* Renders a section of quick filter buttons for search functionality.
* @example
* QuickFiltersSection({ filters: {}, setFilters: function, clearFilters: function })
* <div> ... </div>
* @param {Object} filters - An object containing current filter settings.
* @param {Function} setFilters - A function to update filter settings when a button is clicked.
* @param {Function} clearFilters - A function to reset all filter settings.
* @returns {JSX.Element} A JSX element representing the filter buttons section.
* @description
*   - Includes 'Open Now' toggle button to filter by current availability.
*   - Utilizing custom component 'Button' with adaptability for dark mode.
*   - Modular application of style classes for consistent appearance across components.
*/
export function QuickFiltersSection({
  filters,
  setFilters,
  clearFilters,
}: QuickFiltersSectionProps) {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant={filters.openNow ? 'default' : 'outline'}
        size="sm"
        onClick={() => setFilters({ ...filters, openNow: !filters.openNow })}
        className="dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700"
      >
        <Clock className="size-4 mr-1" />
        Open Now
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={clearFilters}
        className="dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700"
      >
        Clear All
      </Button>
    </div>
  );
}
