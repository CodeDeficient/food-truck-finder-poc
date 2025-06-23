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
    filters.openNow === true
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
