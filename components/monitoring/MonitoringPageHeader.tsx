import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

export function MonitoringPageHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Monitoring & Alerting</h1>
        <p className="text-muted-foreground">
          Real-time monitoring, alerting, and optimization for external API usage
        </p>
      </div>
      <Badge variant="outline" className="text-sm">
        <Activity className="h-4 w-4 mr-1" />
        Live Monitoring
      </Badge>
    </div>
  );
}
