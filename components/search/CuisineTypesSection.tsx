'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { type SearchFilters } from '../SearchFilters'; // Import SearchFilters interface

interface CuisineTypesSectionProps {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
  readonly cuisineTypes: readonly string[];
}

export function CuisineTypesSection({
  filters,
  setFilters,
  cuisineTypes,
}: CuisineTypesSectionProps) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block dark:text-gray-100">Cuisine Type</label>
      <div className="flex flex-wrap gap-2">
        {cuisineTypes.map((cuisine) => (
          <Badge
            key={cuisine}
            variant={filters.cuisine === cuisine ? 'default' : 'outline'}
            className="cursor-pointer dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700"
            onClick={() =>
              setFilters({
                ...filters,
                cuisine: filters.cuisine === cuisine ? '' : cuisine,
              })
            }
          >
            {cuisine}
          </Badge>
        ))}
      </div>
    </div>
  );
}
