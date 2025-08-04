interface DataQualityStats {
    high_quality_count: number;
    medium_quality_count: number;
    low_quality_count: number;
}
interface QualityDistributionCardProps {
    readonly dataQualityStats: DataQualityStats;
}
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
export declare function QualityDistributionCard({ dataQualityStats, }: Readonly<QualityDistributionCardProps>): import("react").JSX.Element;
export {};
