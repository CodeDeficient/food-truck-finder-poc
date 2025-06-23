import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Shield, Zap, TrendingUp } from 'lucide-react';
import { FeatureList } from './FeatureList';

interface MonitoringFeaturesContentProps {
  // No props needed as the content is static
}

export function MonitoringFeaturesContent({}: Readonly<MonitoringFeaturesContentProps>) {
  const proactiveMonitoringItems = [
    { icon: <Activity />, text: 'Real-time usage tracking for all APIs', iconColorClass: 'text-blue-600' },
    { icon: <Shield />, text: 'Predictive limit checking before requests', iconColorClass: 'text-green-600' },
    { icon: <Zap />, text: 'Automatic throttling to prevent quota exceeded', iconColorClass: 'text-yellow-600' },
    { icon: <TrendingUp />, text: 'Historical usage trends and analytics', iconColorClass: 'text-purple-600' },
  ];

  const smartAlertingItems = [
    { icon: <Activity />, text: 'Multi-level alerts (Warning 80%, Critical 95%)', iconColorClass: 'text-orange-600' },
    { icon: <Shield />, text: 'Service-specific recommendations', iconColorClass: 'text-red-600' },
    { icon: <Zap />, text: 'Optimization suggestions for high usage', iconColorClass: 'text-blue-600' },
    { icon: <TrendingUp />, text: 'Wait time calculations for rate limit resets', iconColorClass: 'text-green-600' },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FeatureList title="Proactive Monitoring" items={proactiveMonitoringItems} />
      <FeatureList title="Smart Alerting" items={smartAlertingItems} />
    </div>
  );
}
