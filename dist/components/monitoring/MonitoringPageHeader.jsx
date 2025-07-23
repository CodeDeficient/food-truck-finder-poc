import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
/**
 * Renders the header component for the API Monitoring & Alerting page.
 * @example
 * MonitoringPageHeader()
 * <div>...</div>
 * @returns {JSX.Element} A JSX element rendering the header of the API Monitoring & Alerting page.
 * @description
 *   - Includes a title and description related to API monitoring and alerting.
 *   - Displays a badge indicating the live monitoring status.
 *   - Utilizes styling classes to ensure responsive design and text formatting.
 */
export function MonitoringPageHeader() {
    return (<div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">API Monitoring & Alerting</h1>
        <p className="text-muted-foreground">
          Real-time monitoring, alerting, and optimization for external API usage
        </p>
      </div>
      <Badge variant="outline" className="text-sm">
        <Activity className="size-4 mr-1"/>
        Live Monitoring
      </Badge>
    </div>);
}
