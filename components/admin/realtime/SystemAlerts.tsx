'use client';

import React from 'react';
import { SystemAlertItem } from './SystemAlertItem';
import { AlertToggleButton } from './AlertToggleButton';
import { type SystemAlert } from './status-helpers'; // Import SystemAlert type

interface SystemAlertsProps {
  alerts: SystemAlert[];
  showDetails: boolean;
  onToggleDetails: () => void;
  onAcknowledgeAlert: (alertId: string) => void;
}

export function SystemAlerts({ alerts, showDetails, onToggleDetails, onAcknowledgeAlert }: SystemAlertsProps) {
  if (alerts.length === 0) return null;
  const visibleAlerts = showDetails ? alerts : alerts.slice(0, 3);
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Alerts</h4>
      <div className="space-y-2">
        {visibleAlerts.map((alert) => (
          <SystemAlertItem
            key={alert.id}
            alert={alert}
            onAcknowledgeAlert={onAcknowledgeAlert}
          />
        ))}
      </div>
      <AlertToggleButton
        alertsLength={alerts.length}
        showDetails={showDetails}
        onToggleDetails={onToggleDetails}
      />
    </div>
  );
}
