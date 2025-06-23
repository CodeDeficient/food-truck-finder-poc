import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

interface FilterToggleButtonProps {
  readonly showAdvanced: boolean;
  readonly setShowAdvanced: (show: boolean) => void;
  readonly activeFilterCount: number;
}

export function FilterToggleButton({
  showAdvanced,
  setShowAdvanced,
  activeFilterCount,
}: FilterToggleButtonProps) {
  return (
    <Button
      variant="outline"
      onClick={() => setShowAdvanced(!showAdvanced)}
      className="dark:text-gray-300 dark:border-slate-600 dark:hover:bg-slate-700 flex-shrink-0"
    >
      <Filter className="h-4 w-4 mr-2" />
      Filters
      {activeFilterCount > 0 && (
        <Badge variant="secondary" className="ml-2 dark:bg-slate-700 dark:text-gray-300">
          {activeFilterCount}
        </Badge>
      )}
    </Button>
  );
}
