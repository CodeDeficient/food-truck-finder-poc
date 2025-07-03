'use client';

import React from 'react';
import { type SystemAlert } from './status-helpers'; // Import SystemAlert type
import { AlertListDisplay } from './AlertListDisplay'; // Import the new component

interface SystemAlertsProps {
  readonly alerts: SystemAlert[];
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
  readonly onAcknowledgeAlert: (alertId: string) => void;
}

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
