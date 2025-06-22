import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatQualityScore, type QualityCategory } from '@/lib/utils/dataQualityFormatters';
import { QualityMetricsGrid } from './QualityMetricsGrid';

interface DataQualityCardProps {
  truck: {
    data_quality_score?: number;
    verification_status?: string;
    created_at?: string;
    updated_at?: string
  };
  qualityCategory: QualityCategory;
}

export function DataQualityCard({ truck, qualityCategory }: DataQualityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Quality Assessment</CardTitle>
        <CardDescription>
          Quality score: {formatQualityScore(truck.data_quality_score)}
          ({qualityCategory.label} quality)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <QualityMetricsGrid truck={truck} qualityCategory={qualityCategory} />
      </CardContent>
    </Card>
  );
}
