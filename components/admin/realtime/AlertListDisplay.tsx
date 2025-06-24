'use client';

import React from 'react';
import { SystemAlertItem } from './SystemAlertItem';
import { AlertToggleButton } from './AlertToggleButton';
import { type SystemAlert } from './status-helpers';

interface AlertListDisplayProps {
  readonly alerts: readonly SystemAlert[];
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
  readonly onAcknowledgeAlert: (alertId: string) => void;
}

export function AlertListDisplay({ alerts, showDetails, onToggleDetails, onAcknowledgeAlert }: Readonly<AlertListDisplayProps>) {
  const visibleAlerts = showDetails ? alerts : alerts.slice(0, 3);
  return (
    <>
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
    </>
  );
}
