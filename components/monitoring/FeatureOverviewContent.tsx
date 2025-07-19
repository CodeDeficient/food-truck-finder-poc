
import { Activity, Shield, Zap, TrendingUp } from 'lucide-react';
import { FeatureCard } from './FeatureCard';

/**
 * Renders a grid containing feature cards for an application's dashboard.
 * @example
 * FeatureOverviewContent()
 * // Returns a JSX structure with feature cards displaying monitoring metrics.
 * @returns {JSX.Element} Returns a div containing multiple FeatureCard components.
 * @description
 *   - Utilizes the CSS class grid layout that adjusts columns based on screen size.
 *   - Each FeatureCard depicts a unique monitoring aspect with associated details.
 *   - Icons are colored based on the feature state they represent.
 *   - Designed to provide quick summaries of monitoring features with real-time data.
 */
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
