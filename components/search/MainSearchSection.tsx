'use client';


import { Button } from '@/components/ui/button';
import { SearchInputWithIcon } from './SearchInputWithIcon';
import { FilterToggleButton } from './FilterToggleButton';
import { type SearchFilters } from '../SearchFilters'; // Import SearchFilters interface

interface MainSearchSectionProps {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
  readonly loading?: boolean;
  readonly handleSearch: () => void;
  readonly showAdvanced: boolean;
  readonly setShowAdvanced: (show: boolean) => void;
  readonly activeFilterCount: number;
}

/**
 * Renders the main search section with input, button, and advanced filter toggle.
 * @example
 * MainSearchSection({
 *   filters: { query: '' },
 *   setFilters: (filters) => { /* update filters */
export function MainSearchSection({
  filters,
  setFilters,
  loading,
  handleSearch,
  showAdvanced,
  setShowAdvanced,
  activeFilterCount,
}: MainSearchSectionProps) {
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
      <Button onClick={handleSearch} disabled={loading} className="shrink-0">
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
