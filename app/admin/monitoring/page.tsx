
import { ApiMonitoringDashboard } from '@/components/monitoring/ApiMonitoringDashboard';
import { MonitoringPageHeader } from '@/components/monitoring/MonitoringPageHeader';
import { FeatureOverviewCards } from '@/components/monitoring/FeatureOverviewCards';
import { MonitoringFeaturesCard } from '@/components/monitoring/MonitoringFeaturesCard';
import { TechnicalDetailsCard } from '@/components/monitoring/TechnicalDetailsCard';

/**
 * API Monitoring Page
 * Provides comprehensive real-time monitoring of all external API usage
 */
export default function MonitoringPage() {
  return (
    <div className="flex flex-col gap-6">
      <MonitoringPageHeader />
      <FeatureOverviewCards />
      <MonitoringFeaturesCard />
      <ApiMonitoringDashboard />
      <TechnicalDetailsCard />
    </div>
  );
}
