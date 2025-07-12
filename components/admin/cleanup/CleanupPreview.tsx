'use client';


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface CleanupPreviewProps {
  readonly previewData: unknown;
}

/**
* Renders a card component displaying cleanup preview data for trucks.
* @example
* CleanupPreview({ previewData: { estimated_improvements: 5, estimated_duplicates: 2, operations: [] } })
* Returns a JSX element with estimated changes summary.
* @param {CleanupPreviewProps} { previewData } - Object containing the preview data for cleanup estimation.
* @returns {JSX.Element | undefined} Returns a card element showcasing the estimated truck improvements, duplicates found, operations ready, and improvement rate; undefined if previewData is not provided.
* @description
*   - Utilizes conditionally rendered data based on the `previewData` property values.
*   - The improvement rate is calculated approximately as a percentage of estimated improvements out of a sample of 10 trucks.
*/
export function CleanupPreview({ previewData }: CleanupPreviewProps) {
  if (previewData === undefined) {
    return;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cleanup Preview</CardTitle>
        <CardDescription>Estimated changes (based on sample of 10 trucks)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(previewData as { estimated_improvements: number }).estimated_improvements}
            </div>
            <div className="text-sm text-muted-foreground">Trucks to Improve</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(previewData as { estimated_duplicates: number }).estimated_duplicates}
            </div>
            <div className="text-sm text-muted-foreground">Duplicates Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(previewData as { operations?: unknown[] }).operations?.length ?? 0}
            </div>
            <div className="text-sm text-muted-foreground">Operations Ready</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              ~
              {Math.round(
                ((previewData as { estimated_improvements: number }).estimated_improvements / 10) *
                  100,
              )}
              %
            </div>
            <div className="text-sm text-muted-foreground">Improvement Rate</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
