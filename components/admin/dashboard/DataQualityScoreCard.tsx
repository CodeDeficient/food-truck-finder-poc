import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings } from 'lucide-react';

interface DataQualityStats {
  avg_quality_score: number;
}

interface DataQualityScoreCardProps {
  readonly dataQualityStats: DataQualityStats;
}

export function DataQualityScoreCard({ dataQualityStats }: Readonly<DataQualityScoreCardProps>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {((dataQualityStats.avg_quality_score ?? 0) * 100).toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground">Average quality score across all trucks</p>
      </CardContent>
    </Card>
  );
}
