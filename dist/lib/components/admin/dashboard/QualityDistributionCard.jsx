import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
/**
* Renders a card displaying the distribution of quality stats.
* @example
* QualityDistributionCard({ dataQualityStats: { high_quality_count: 5, medium_quality_count: 3, low_quality_count: 2 } })
* Returns a React component displaying a card with quality distribution stats.
* @param {Readonly<QualityDistributionCardProps>} dataQualityStats - Contains counts of high, medium, and low quality items to be displayed.
* @returns {JSX.Element} A React card element representing the quality distribution.
* @description
*   - Includes a header with the title "Quality Distribution" and an alert icon.
*   - Displays the count of high-quality items prominently in bold.
*   - Lists counts of high, medium, and low-quality items with respective color-coding.
*   - Falls back to zero if any count statistics are missing using nullish coalescing.
*/
export function QualityDistributionCard({ dataQualityStats, }) {
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Quality Distribution</CardTitle>
        <AlertTriangle className="size-4 text-muted-foreground"/>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">
          {dataQualityStats.high_quality_count ?? 0}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-green-600">{dataQualityStats.high_quality_count ?? 0} high</span>,{' '}
          <span className="text-yellow-600">
            {dataQualityStats.medium_quality_count ?? 0} medium
          </span>
          , <span className="text-red-600">{dataQualityStats.low_quality_count ?? 0} low</span>
        </p>
      </CardContent>
    </Card>);
}
