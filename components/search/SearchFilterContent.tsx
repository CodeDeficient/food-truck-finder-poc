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

/**
 * Renders the search filter content allowing users to adjust search criteria.
 * @example
 * SearchFilterContent({ onSearch: function, loading: true })
 * // Returns JSX for the search filter section with optional advanced filters.
 * @param {Object} props - The properties object.
 * @param {function} props.onSearch - Function to execute when a search is performed.
 * @param {boolean} props.loading - Indicates the loading state of search results.
 * @returns {JSX.Element} The JSX for the main and advanced search filter sections.
 * @description
 *   - Utilizes `useSearchFiltersLogic` hook to manage filter states and actions.
 *   - Renders `MainSearchSection` for primary filter options.
 *   - Conditionally renders `AdvancedFilters` when advanced view is toggled.
 */
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
