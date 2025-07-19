
import type { CleanupResult } from '@/hooks/useDataCleanup';

interface CleanupSummaryCardsProps {
  readonly lastResult: CleanupResult;
}

/**
 * Renders summary cards displaying cleanup operation statistics.
 * @example
 * CleanupSummaryCards({ lastResult: someLastResultObject })
 * <div className="grid ...">...</div>
 * @param {Object} lastResult - The last result containing summary data.
 * @returns {JSX.Element} A grid of styled summary cards.
 * @description
 *   - Displays four cards with different metrics: Trucks Improved, Duplicates Removed, Quality Updates, and Placeholders Removed.
 *   - Each card uses a distinct color scheme that adapts in dark mode.
 *   - Numbers in each card are displayed prominently, and descriptions are given in a smaller font.
 */
export function CleanupSummaryCards({ lastResult }: CleanupSummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
        <div className="text-2xl font-bold text-blue-600">{lastResult.summary.trucksImproved}</div>
        <div className="text-sm text-blue-700 dark:text-blue-300">Trucks Improved</div>
      </div>
      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
        <div className="text-2xl font-bold text-purple-600">
          {lastResult.summary.duplicatesRemoved}
        </div>
        <div className="text-sm text-purple-700 dark:text-purple-300">Duplicates Removed</div>
      </div>
      <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
        <div className="text-2xl font-bold text-green-600">
          {lastResult.summary.qualityScoreImprovement}
        </div>
        <div className="text-sm text-green-700 dark:text-green-300">Quality Updates</div>
      </div>
      <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
        <div className="text-2xl font-bold text-red-600">
          {lastResult.summary.placeholdersRemoved}
        </div>
        <div className="text-sm text-red-700 dark:text-red-300">Placeholders Removed</div>
      </div>
    </div>
  );
}
