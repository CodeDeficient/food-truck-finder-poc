import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Shield, Zap, TrendingUp } from 'lucide-react';

export function MonitoringFeaturesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitoring Features</CardTitle>
        <CardDescription>
          State-of-the-art API monitoring and alerting capabilities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Proactive Monitoring</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-blue-600" />
                Real-time usage tracking for all APIs
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-green-600" />
                Predictive limit checking before requests
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-yellow-600" />
                Automatic throttling to prevent quota exceeded
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-purple-600" />
                Historical usage trends and analytics
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Smart Alerting</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-orange-600" />
                Multi-level alerts (Warning 80%, Critical 95%)
              </li>
              <li className="flex items-center gap-2">
                <Shield className="h-3 w-3 text-red-600" />
                Service-specific recommendations
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-3 w-3 text-blue-600" />
                Optimization suggestions for high usage
              </li>
              <li className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-600" />
                Wait time calculations for rate limit resets
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
