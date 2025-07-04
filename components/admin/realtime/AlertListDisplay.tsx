'use client';

import React from 'react';
import { SystemAlertItem } from './SystemAlertItem';
import { AlertToggleButton } from './AlertToggleButton';
import { type SystemAlert } from '@/hooks/useSystemAlerts';

interface AlertListDisplayProps {
  readonly alerts: readonly SystemAlert[];
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
  readonly onAcknowledgeAlert: (alertId: string) => void;
}

/**
 * Displays a list of system alerts with optional details toggle functionality.
 * @example
 * AlertListDisplay({ alerts: alertArray, showDetails: true, onToggleDetails: handleToggle, onAcknowledgeAlert: handleAcknowledge })
 * JSX element displaying SystemAlertItem components and AlertToggleButton
 * @param {Readonly<AlertListDisplayProps>} props - The properties needed for displaying alerts including alert data, detail toggle state, and event handlers.
 * @returns {JSX.Element} JSX element containing the list of alerts and a button to toggle details.
 * @description
 *   - If `showDetails` is false, only displays up to three alerts.
 *   - Utilizes `SystemAlertItem` and `AlertToggleButton` components for rendering each alert and detail toggle functionality.
 *   - The `onToggleDetails` function toggles the visibility of the full alert list.
 *   - `onAcknowledgeAlert` handles acknowledging individual alerts.
 */
export function AlertListDisplay({
  alerts,
  showDetails,
  onToggleDetails,
  onAcknowledgeAlert,
}: Readonly<AlertListDisplayProps>) {
  const visibleAlerts = showDetails ? alerts : alerts.slice(0, 3);
  return (
    <>
      <div className="space-y-2">
        {visibleAlerts.map((alert) => (
          <SystemAlertItem key={alert.id} alert={alert} onAcknowledgeAlert={onAcknowledgeAlert} />
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
