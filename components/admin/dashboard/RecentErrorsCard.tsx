import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

interface RecentErrorsCardProps {
  failedProcessingQueueItemsCount: number;
}

export function RecentErrorsCard({ failedProcessingQueueItemsCount }: Readonly<RecentErrorsCardProps>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Recent Errors</CardTitle>
        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{failedProcessingQueueItemsCount}</div>
        <p className="text-xs text-muted-foreground">from data processing queue</p>
      </CardContent>
    </Card>
  );
}
