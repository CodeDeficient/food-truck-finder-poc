'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
/**
 * Renders a guide for various cleanup operations.
 * @example
 * CleanupGuide()
 * <Card>...</Card>
 * @returns {JSX.Element} The rendered component containing the cleanup operations guide.
 * @description
 *   - Provides detailed descriptions of various data cleanup operations.
 *   - Includes instructions for removing placeholders and normalizing data formats.
 *   - Highlights methods for correcting data errors and enhancing data quality.
 *   - Discusses automatic merging of duplicate records to streamline data management.
 */
export function CleanupGuide() {
    return (<Card>
      <CardHeader>
        <CardTitle>Cleanup Operations Guide</CardTitle>
        <CardDescription>Understanding what each cleanup operation does</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div>
            <strong>Remove Placeholders:</strong> Removes test data, "undefined" values, and
            placeholder content that shouldn't be in production.
          </div>
          <div>
            <strong>Normalize Phone Numbers:</strong> Formats phone numbers consistently (e.g.,
            "(843) 555-0123").
          </div>
          <div>
            <strong>Fix GPS Coordinates:</strong> Corrects invalid coordinates (0,0) and coordinates
            outside the Charleston area.
          </div>
          <div>
            <strong>Update Quality Scores:</strong> Recalculates data quality scores based on
            current data completeness.
          </div>
          <div>
            <strong>Merge Duplicates:</strong> Identifies and merges duplicate food truck entries
            automatically.
          </div>
        </div>
      </CardContent>
    </Card>);
}
