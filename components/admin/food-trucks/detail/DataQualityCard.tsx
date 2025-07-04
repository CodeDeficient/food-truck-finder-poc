import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatQualityScore, type QualityCategory } from '@/lib/utils/dataQualityFormatters';
import { QualityMetricsGrid } from './QualityMetricsGrid';

interface DataQualityCardProps {
  readonly truck: {
    data_quality_score?: number;
    verification_status?: string;
    created_at?: string;
    updated_at?: string;
  };
  readonly qualityCategory: QualityCategory;
}

/**
 * Render a card component displaying the data quality assessment for a given truck.
 * @example
 * DataQualityCard({ truck: sampleTruck, qualityCategory: sampleQualityCategory })
 * <Card>...</Card>
 * @param {Object} truck - The truck object containing data quality information.
 * @param {Object} qualityCategory - The quality category object containing a label for quality assessment.
 * @returns {JSX.Element} A card component representing the data quality assessment for a truck.
 * @description
 *   - Utilizes formatQualityScore to display the truck's data quality score.
 *   - Combines truck data quality score with the quality category label for detailed assessment.
 *   - Uses QualityMetricsGrid to visualize specific metrics related to the truck's data quality.
 */
export function DataQualityCard({ truck, qualityCategory }: Readonly<DataQualityCardProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Quality Assessment</CardTitle>
        <CardDescription>
          Quality score: {formatQualityScore(truck.data_quality_score)}({qualityCategory.label}{' '}
          quality)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QualityMetricsGrid truck={truck} qualityCategory={qualityCategory} />
      </CardContent>
    </Card>
  );
}
