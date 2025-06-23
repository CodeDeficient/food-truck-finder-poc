'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { SearchInputWithIcon } from './search/SearchInputWithIcon';
import { FilterToggleButton } from './search/FilterToggleButton'; // Import the new component
import { useSearchFiltersLogic } from '@/hooks/useSearchFiltersLogic';
import { SearchFilterContent } from './search/SearchFilterContent'; // Import the new component

export interface SearchFilters {
  query: string;
  cuisine: string;
  openNow: boolean;
  radius: number;
}

interface SearchFiltersProps {
  readonly onSearch: (filters: SearchFilters) => void;
  readonly loading?: boolean;
}

export function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardContent className="p-4">
        <SearchFilterContent onSearch={onSearch} loading={loading} />
      </CardContent>
    </Card>
  );
}

// Exporting sub-components for use in SearchFilterContent
export function MainSearchSection({
  filters,
  setFilters,
  loading,
  handleSearch,
  showAdvanced,
  setShowAdvanced,
  activeFilterCount,
}: {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
  readonly loading?: boolean;
  readonly handleSearch: () => void;
  readonly showAdvanced: boolean;
  readonly setShowAdvanced: (show: boolean) => void;
  readonly activeFilterCount: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 sm:space-x-2">
      <SearchInputWithIcon
        placeholder="Search food trucks, cuisine, or menu items..."
        value={filters.query}
        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />
      <Button onClick={handleSearch} disabled={loading} className="flex-shrink-0">
        Search
      </Button>
      <FilterToggleButton
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        activeFilterCount={activeFilterCount}
      />
    </div>
  );
}

export function QuickFiltersSection({
  filters,
  setFilters,
  clearFilters
}: {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
  readonly clearFilters: () => void;
}) {
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

export function CuisineTypesSection({
  filters,
  setFilters,
  cuisineTypes
}: {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
  readonly cuisineTypes: readonly string[];
}) {
  return (
    <div>
      <label className="text-sm font-medium mb-2 block dark:text-gray-100">
        Cuisine Type
      </label>
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

export function DistanceSliderSection({
  filters,
  setFilters
}: {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
}) {
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

export function AdvancedFilters({
  filters,
  setFilters,
  clearFilters,
  cuisineTypes,
}: {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
  readonly clearFilters: () => void;
  readonly cuisineTypes: readonly string[];
}) {
  return (
    <div className="space-y-4 pt-4 border-t dark:border-slate-700">
      <QuickFiltersSection filters={filters} setFilters={setFilters} clearFilters={clearFilters} />
      <CuisineTypesSection filters={filters} setFilters={setFilters} cuisineTypes={cuisineTypes} />
      <DistanceSliderSection filters={filters} setFilters={setFilters} />
    </div>
  );
}
