import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface DataQualityStats {
  high_quality_count: number;
  medium_quality_count: number;
  low_quality_count: number;
}

interface QualityDistributionCardProps {
  readonly dataQualityStats: DataQualityStats;
}

export function QualityDistributionCard({ dataQualityStats }: Readonly<QualityDistributionCardProps>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Quality Distribution</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-600">
          {dataQualityStats.high_quality_count ?? 0}
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-green-600">{dataQualityStats.high_quality_count ?? 0} high</span>,{' '}
          <span className="text-yellow-600">{dataQualityStats.medium_quality_count ?? 0} medium</span>,{' '}
          <span className="text-red-600">{dataQualityStats.low_quality_count ?? 0} low</span>
        </p>
      </CardContent>
    </Card>
  );
}
