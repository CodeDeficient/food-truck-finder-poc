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
    var _a, _b, _c, _d;
    return (<Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Quality Distribution</CardTitle>
        <AlertTriangle className="size-4 text-muted-foreground"/>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">
          {(_a = dataQualityStats.high_quality_count) !== null && _a !== void 0 ? _a : 0}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-green-600">{(_b = dataQualityStats.high_quality_count) !== null && _b !== void 0 ? _b : 0} high</span>,{' '}
          <span className="text-yellow-600">
            {(_c = dataQualityStats.medium_quality_count) !== null && _c !== void 0 ? _c : 0} medium
          </span>
          , <span className="text-red-600">{(_d = dataQualityStats.low_quality_count) !== null && _d !== void 0 ? _d : 0} low</span>
        </p>
      </CardContent>
    </Card>);
}
