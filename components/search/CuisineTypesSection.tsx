'use client';


import { Badge } from '@/components/ui/badge';
import { type SearchFilters } from '../SearchFilters'; // Import SearchFilters interface

interface CuisineTypesSectionProps {
  readonly filters: SearchFilters;
  readonly setFilters: (filters: SearchFilters) => void;
  readonly cuisineTypes: readonly string[];
}

/**
 * Renders a section for selecting cuisine types with interactive badges.
 * @example
 * CuisineTypesSection({filters, setFilters, cuisineTypes})
 * <div>...</div>
 * @param {Object} props - Properties passed to the component.
 * @param {Object} props.filters - Current state of the cuisine filters.
 * @param {Function} props.setFilters - Function to update the filter state.
 * @param {Array} props.cuisineTypes - List of cuisine types to display.
 * @returns {JSX.Element} Returns a div containing cuisine type badges.
 * @description
 *   - Uses the `Badge` component to display each cuisine type.
 *   - Allows toggling a cuisine type filter by clicking on a badge.
 *   - Applies a different visual style if the cuisine type is selected.
 */
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
