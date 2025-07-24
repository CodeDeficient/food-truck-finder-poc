interface DataQualityStats {
    avg_quality_score: number;
}
interface DataQualityScoreCardProps {
    readonly dataQualityStats: DataQualityStats;
}
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
export declare function DataQualityScoreCard({ dataQualityStats }: Readonly<DataQualityScoreCardProps>): import("react").JSX.Element;
export {};
