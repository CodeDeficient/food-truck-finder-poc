'use client';


import { type SystemAlert } from '@/hooks/useSystemAlerts'; // Import SystemAlert type
import { AlertListDisplay } from './AlertListDisplay'; // Import the new component

interface SystemAlertsProps {
  readonly alerts: SystemAlert[];
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
  readonly onAcknowledgeAlert: (alertId: string) => void;
}

/**
 * Renders a list of recent system alerts.
 * @example
 * SystemAlerts({ alerts: [], showDetails: false, onToggleDetails: () => {}, onAcknowledgeAlert: () => {} })
 * // Returns undefined if there are no alerts to display.
 * @param {Object} {alerts} - Array of alert objects to display.
 * @param {boolean} {showDetails} - Flag to indicate whether alert details are shown.
 * @param {function} {onToggleDetails} - Callback function invoked to toggle alert details.
 * @param {function} {onAcknowledgeAlert} - Callback function invoked when acknowledging an alert.
 * @returns {JSX.Element | undefined} Returns a JSX element containing the alert list or undefined if no alerts are present.
 * @description
 *   - Ensures alerts are only rendered if there are any present.
 *   - Utilizes the AlertListDisplay component to render the alert list with configured callbacks.
 */
export function SystemAlerts({
  alerts,
  showDetails,
  onToggleDetails,
  onAcknowledgeAlert,
}: SystemAlertsProps) {
  if (alerts.length === 0) return;
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Alerts</h4>
      <AlertListDisplay
        alerts={alerts}
        showDetails={showDetails}
        onToggleDetails={onToggleDetails}
        onAcknowledgeAlert={onAcknowledgeAlert}
      />
    </div>
  );
}
