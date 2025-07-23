import { Activity, Shield, Zap, TrendingUp } from 'lucide-react';
import { FeatureList } from './FeatureList';
/**
 * Component for displaying monitoring features with icons and descriptions
 * @example
 * MonitoringFeaturesContent()
 * returns a JSX element containing two feature lists
 * @param {none} - This function does not require any arguments.
 * @returns {JSX.Element} A JSX element that represents a grid of features.
 * @description
 *   - Utilizes a grid layout to separate feature categories.
 *   - Combines proactive monitoring items and smart alerting items.
 *   - Each feature is represented with an icon and descriptive text.
 *   - Applies specific color classes to icons for visual distinction.
 */
export function MonitoringFeaturesContent() {
    const proactiveMonitoringItems = [
        {
            icon: <Activity />,
            text: 'Real-time usage tracking for all APIs',
            iconColorClass: 'text-blue-600',
        },
        {
            icon: <Shield />,
            text: 'Predictive limit checking before requests',
            iconColorClass: 'text-green-600',
        },
        {
            icon: <Zap />,
            text: 'Automatic throttling to prevent quota exceeded',
            iconColorClass: 'text-yellow-600',
        },
        {
            icon: <TrendingUp />,
            text: 'Historical usage trends and analytics',
            iconColorClass: 'text-purple-600',
        },
    ];
    const smartAlertingItems = [
        {
            icon: <Activity />,
            text: 'Multi-level alerts (Warning 80%, Critical 95%)',
            iconColorClass: 'text-orange-600',
        },
        { icon: <Shield />, text: 'Service-specific recommendations', iconColorClass: 'text-red-600' },
        {
            icon: <Zap />,
            text: 'Optimization suggestions for high usage',
            iconColorClass: 'text-blue-600',
        },
        {
            icon: <TrendingUp />,
            text: 'Wait time calculations for rate limit resets',
            iconColorClass: 'text-green-600',
        },
    ];
    return (<div className="grid gap-4 md:grid-cols-2">
      <FeatureList title="Proactive Monitoring" items={proactiveMonitoringItems}/>
      <FeatureList title="Smart Alerting" items={smartAlertingItems}/>
    </div>);
}
