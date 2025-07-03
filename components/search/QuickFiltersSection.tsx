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
        <Clock className="h-4 w-4 mr-1" />
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
