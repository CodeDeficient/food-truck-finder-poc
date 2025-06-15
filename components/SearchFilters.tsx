'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
// @ts-expect-error TS(2792): Cannot find module 'lucide-react'. Did you mean to... Remove this comment to see the full error message
import { Search, Filter, Clock } from 'lucide-react';

interface SearchFiltersProps {
  readonly onSearch: (filters: SearchFilters) => void;
  readonly loading?: boolean;
}

interface SearchFilters {
  query: string;
  cuisine: string;
  openNow: boolean;
  radius: number;
}

export function SearchFilters({ onSearch, loading }: SearchFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    cuisine: '',
    openNow: false,
    radius: 10,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const cuisineTypes = [
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
  ];

  const handleSearch = () => {
    onSearch(filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      query: '',
      cuisine: '',
      openNow: false,
      radius: 10,
    };
    setFilters(clearedFilters);
    onSearch(clearedFilters);
  };

  const activeFilterCount = [
    filters.query !== '',
    filters.cuisine !== '',
    filters.openNow === true
  ].filter(Boolean).length;

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Main Search */}
          <div className="flex flex-wrap items-center gap-2 sm:space-x-2">
            {' '}
            {/* Allow wrapping and adjust gap */}
            <div className="relative flex-grow min-w-[200px]">
              {' '}
              {/* Use flex-grow and min-w for input section */}
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search food trucks, cuisine, or menu items..."
                value={filters.query}
                onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                className="pl-10 w-full dark:bg-slate-700 dark:text-gray-100 dark:placeholder-gray-400" // Ensure input takes full width of its container
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="flex-shrink-0">
              {' '}
              {/* Prevent button from shrinking excessively */}
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700 flex-shrink-0"
            >
              {' '}
              {/* Prevent button from shrinking */}
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <Badge variant="secondary" className="ml-2 dark:bg-slate-700 dark:text-gray-300">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Advanced Filters */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t dark:border-slate-700">
              {/* Quick Filters */}
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

              {/* Cuisine Types */}
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

              {/* Distance */}
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
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
