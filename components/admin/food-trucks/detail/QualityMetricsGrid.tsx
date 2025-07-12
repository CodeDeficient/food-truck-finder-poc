
import { Badge } from '@/components/ui/badge';
import { formatQualityScore, type QualityCategory } from '@/lib/utils/dataQualityFormatters';
import { QualityScoreMetric } from './QualityScoreMetric';

interface QualityMetricsGridProps {
  readonly truck: {
    data_quality_score?: number;
    verification_status?: string;
    created_at?: string;
    updated_at?: string;
  };
  readonly qualityCategory: QualityCategory;
}

/**
 * Renders a grid displaying various quality metrics for a food truck.
 * @example
 * QualityMetricsGrid({ truck: truckData, qualityCategory: qualityCategory })
 * <div> rendered grid component </div>
 * @param {object} {truck} - Truck data object containing quality scores and timestamps.
 * @param {object} {_qualityCategory} - Category of quality metrics to be displayed.
 * @returns {JSX.Element} A JSX element representing the quality metrics grid.
 * @description
 *   - Utilizes <QualityScoreMetric> component to render individual metrics.
 *   - Formats date values and handles empty date scenarios with 'N/A'.
 *   - Classnames are used to style different verification status states.
 */
export function QualityMetricsGrid({
  truck,
  qualityCategory: _qualityCategory, // Renamed to _qualityCategory
}: QualityMetricsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <QualityScoreMetric
        value={
          <div className="text-2xl font-bold text-blue-600">
            {formatQualityScore(truck.data_quality_score)}
          </div>
        }
        label="Overall Score"
        className=""
      />

      <QualityScoreMetric
        value={
          <Badge variant={truck.verification_status === 'verified' ? 'default' : 'outline'}>
            {truck.verification_status}
          </Badge>
        }
        label="Status"
        className=""
      />

      <QualityScoreMetric
        value={
          truck.created_at != undefined && truck.created_at !== ''
            ? new Date(truck.created_at).toLocaleDateString()
            : 'N/A'
        }
        label="Created"
      />

      <QualityScoreMetric
        value={
          truck.updated_at != undefined && truck.updated_at !== ''
            ? new Date(truck.updated_at).toLocaleDateString()
            : 'N/A'
        }
        label="Updated"
      />
    </div>
  );
}
