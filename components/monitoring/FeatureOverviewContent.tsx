import React from 'react';
import { Activity, Shield, Zap, TrendingUp } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

export function FeatureOverviewContent() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <FeatureCard
        title="Proactive Monitoring"
        icon={<Activity />}
        iconColorClass="text-blue-600"
        value="Real-time"
        valueColorClass="text-blue-600"
        description="Live API usage tracking with 30-second refresh"
      />

      <FeatureCard
        title="Smart Alerting"
        icon={<Shield />}
        iconColorClass="text-yellow-600"
        value="80% / 95%"
        valueColorClass="text-yellow-600"
        description="Warning / Critical thresholds with recommendations"
      />

      <FeatureCard
        title="Auto Throttling"
        icon={<Zap />}
        iconColorClass="text-green-600"
        value="Enabled"
        valueColorClass="text-green-600"
        description="Prevents quota exceeded errors automatically"
      />

      <FeatureCard
        title="Optimization"
        icon={<TrendingUp />}
        iconColorClass="text-purple-600"
        value="SOTA"
        valueColorClass="text-purple-600"
        description="AI-powered usage optimization recommendations"
      />
    </div>
  );
}
