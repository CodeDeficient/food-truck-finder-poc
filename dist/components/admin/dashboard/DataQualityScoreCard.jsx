import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';
/**
 * Renders a data quality score card component with quality statistics.
 * @example
 * DataQualityScoreCard({ dataQualityStats: { avg_quality_score: 0.85 } })
 * Displays the card with title "Data Quality Score" and shows "85.0%"
 * @param {Readonly<DataQualityScoreCardProps>} dataQualityStats - The statistics object containing the average quality score.
 * @returns {JSX.Element} A card displaying the average data quality score.
 * @description
 *   - Utilizes a Card layout with a header and content section.
 *   - Displays an icon for settings in the card header.
 *   - Formats the average quality score as a percentage with one decimal precision.
 */
export function DataQualityScoreCard({ dataQualityStats }) {
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
        <Settings className="size-4 text-muted-foreground"/>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {((dataQualityStats.avg_quality_score ?? 0) * 100).toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground">Average quality score across all trucks</p>
      </CardContent>
    </Card>);
}
