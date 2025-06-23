'use client';

import React from 'react';
import { MainSearchSection } from '../SearchFilters'; // Assuming MainSearchSection is exported from SearchFilters for now
import { AdvancedFilters } from '../SearchFilters'; // Assuming AdvancedFilters is exported from SearchFilters for now
import { useSearchFiltersLogic } from '@/hooks/useSearchFiltersLogic';

interface SearchFilterContentProps {
  readonly onSearch: (filters: SearchFilters) => void;
  readonly loading?: boolean;
}

interface SearchFilters {
  query: string;
  cuisine: string;
  openNow: boolean;
  radius: number;
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
