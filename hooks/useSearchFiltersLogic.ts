import { useState } from 'react';

interface SearchFilters {
  query: string;
  cuisine: string;
  openNow: boolean;
  radius: number;
}

const initialFilters: SearchFilters = {
  query: '',
  cuisine: '',
  openNow: false,
  radius: 10,
};

const CUISINE_TYPES = [
  'Mexican',
  'American',
  'Asian',
  'Italian',
  'BBQ',
  'Burgers',
  'Tacos',
  'Pizza',
  'Sandwiches',
  'Desserts',
] as const; // Use 'as const' for immutability

/**
 * Manages search filters logic including applying, clearing, and counting active filters.
 * @example
 * useSearchFiltersLogic(onSearchCallback)
 * // { filters: {...}, setFilters: f, showAdvanced: false, setShowAdvanced: f, handleSearch: f, clearFilters: f, activeFilterCount: 1, cuisineTypes: [...] }
 * @param {Function} onSearch - A callback function invoked with the current or cleared filters.
 * @returns {Object} Returns an object with filters management properties and methods.
 * @description
 *   - handleSearch triggers the onSearch callback with current filters.
 *   - clearFilters resets filters to their initial state and triggers a search with these filters.
 *   - activeFilterCount counts non-empty or active filters, useful for indicating how many filters are currently applied.
 *   - cuisineTypes provides a static list of cuisine types available for filtering.
 */
export function useSearchFiltersLogic(onSearch: (filters: SearchFilters) => void) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    onSearch(initialFilters);
  };

  const activeFilterCount = [
    filters.query !== '',
    filters.cuisine !== '',
    filters.openNow === true,
  ].filter(Boolean).length;

  return {
    filters,
    setFilters,
    showAdvanced,
    setShowAdvanced,
    handleSearch,
    clearFilters,
    activeFilterCount,
    cuisineTypes: CUISINE_TYPES,
  };
}
