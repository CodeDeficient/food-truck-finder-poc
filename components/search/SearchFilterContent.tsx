'use client';

import React from 'react';
import { useSearchFiltersLogic } from '@/hooks/useSearchFiltersLogic';
import { type SearchFilters } from '../SearchFilters'; // Import SearchFilters interface
import { MainSearchSection } from './MainSearchSection'; // Import from new file
import { AdvancedFilters } from './AdvancedFilters'; // Import from new file

interface SearchFilterContentProps {
  readonly onSearch: (filters: SearchFilters) => void;
  readonly loading?: boolean;
}

export function SearchFilterContent({ onSearch, loading }: SearchFilterContentProps) {
  const {
    filters,
    setFilters,
    showAdvanced,
    setShowAdvanced,
    handleSearch,
    clearFilters,
    activeFilterCount,
    cuisineTypes,
  } = useSearchFiltersLogic(onSearch);

  return (
    <div className="space-y-4">
      <MainSearchSection
        filters={filters}
        setFilters={setFilters}
        loading={loading}
        handleSearch={handleSearch}
        showAdvanced={showAdvanced}
        setShowAdvanced={setShowAdvanced}
        activeFilterCount={activeFilterCount}
      />
      {showAdvanced && (
        <AdvancedFilters
          filters={filters}
          setFilters={setFilters}
          clearFilters={clearFilters}
          cuisineTypes={cuisineTypes}
        />
      )}
    </div>
  );
}
