import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Filter } from 'lucide-react';

interface FilterToggleButtonProps {
  readonly showAdvanced: boolean;
  readonly setShowAdvanced: (show: boolean) => void;
  readonly activeFilterCount: number;
}

/**
 * Toggle the display of advanced filters and indicate active filter count.
 * @example
 * FilterToggleButton({ showAdvanced, setShowAdvanced, activeFilterCount })
 * <Button> component with optional <Badge> showing active filters count
 * @param {boolean} showAdvanced - Indicates whether advanced filters are currently shown.
 * @param {function} setShowAdvanced - Function to toggle the showAdvanced state.
 * @param {number} activeFilterCount - Number of active filters currently applied.
 * @returns {JSX.Element} Button component with optional active filter count badge.
 * @description
 *   - Toggles the presence of advanced filter options in the UI.
 *   - Displays a badge if there are active filters, indicating their count.
 *   - Handles dark mode styling with specific class names.
 */
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
