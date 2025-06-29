'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Settings, Loader2 } from 'lucide-react';

interface SimpleQualityPanelProps {
  readonly onRefresh?: () => void;
}

interface RecalculateAllResult {
  success: boolean;
  data?: {
    updated: number;
    errors: number;
  };
  error?: string;
}

const recalculateAllScores = async (): Promise<RecalculateAllResult> => {
  const response = await fetch('/api/admin/data-quality', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'recalculate_all',
    }),
  });

  const result: unknown = await response.json();

  if (typeof result === 'object' && result !== null && 'success' in result) {
    return result.success === true ? {
        success: true,
        data: {
          updated: (result as { data?: { updated?: number } }).data?.updated ?? 0,
          errors: (result as { data?: { errors?: number } }).data?.errors ?? 0,
        },
      } : {
        success: false,
        error: (result as { error?: string }).error ?? 'Failed to recalculate quality scores',
      };
  }
  return { success: false, error: 'Invalid response format' };
};

const QualityScoreThresholds: React.FC = () => (
  <div className="border rounded-lg p-4 bg-blue-50/50">
    <h4 className="font-medium mb-2 text-blue-900">Quality Score Thresholds</h4>
    <div className="space-y-1 text-sm text-blue-800">
      <div className="flex justify-between">
        <span>High Quality:</span>
        <Badge className="bg-green-100 text-green-800">≥ 80%</Badge>
      </div>
      <div className="flex justify-between">
        <span>Medium Quality:</span>
        <Badge className="bg-yellow-100 text-yellow-800">60% - 79%</Badge>
      </div>
      <div className="flex justify-between">
        <span>Low Quality:</span>
        <Badge className="bg-red-100 text-red-800">{`< 60%`}</Badge>
      </div>
    </div>
  </div>
);

export const SimpleQualityPanel: React.FC<SimpleQualityPanelProps> = ({ onRefresh }) => {
  const [isRecalculating, setIsRecalculating] = useState(false);

  const handleRecalculateAll = async () => {
    setIsRecalculating(true);

    try {
      const result = await recalculateAllScores();
      if (result.success) {
        alert(`Quality scores updated successfully! ${result.data?.updated} trucks updated, ${result.data?.errors} errors.`);
        onRefresh?.();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error recalculating quality scores:', error);
      alert('Failed to recalculate quality scores. Please try again.');
    } finally {
      setIsRecalculating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Quality Management Operations
        </CardTitle>
        <CardDescription>
          Bulk operations for managing data quality scores across all food trucks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => { void handleRecalculateAll(); }}
            disabled={isRecalculating}
            className="flex items-center gap-2"
            variant="default"
          >
            {isRecalculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Recalculate All Scores
          </Button>
        </div>

        <QualityScoreThresholds />

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Recalculate All:</strong> Updates quality scores for all food trucks using the latest algorithm.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleQualityPanel;
