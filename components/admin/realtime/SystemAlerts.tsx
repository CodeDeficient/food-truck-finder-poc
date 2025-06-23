import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SystemAlert {
  readonly id: string;
  readonly type: 'info' | 'warning' | 'error' | 'critical';
  readonly message: string;
  readonly timestamp: string;
  readonly acknowledged?: boolean;
}

interface SystemAlertsProps {
  readonly alerts: SystemAlert[];
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
  readonly onAcknowledgeAlert: (alertId: string) => void;
}

export function SystemAlerts({ alerts, showDetails, onToggleDetails, onAcknowledgeAlert }: Readonly<SystemAlertsProps>) {
  if (alerts.length === 0) return null; // Changed to return null

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
      {alerts.length > 3 && (
        <Button
          variant="outline"
          size="sm"
          className="mt-2"
          onClick={onToggleDetails}
        >
          {showDetails ? 'Hide' : 'Show'} {alerts.length - 3} more alerts
        </Button>
      )}
    </div>
  );
}

// Extracted SystemAlertItem component
interface SystemAlertItemProps {
  readonly alert: SystemAlert;
  readonly onAcknowledgeAlert: (alertId: string) => void;
}

function getAlertClasses(alertType: SystemAlert['type'], acknowledged?: boolean) {
  let classes = '';
  if (alertType === 'critical') classes = 'border-l-red-500 bg-red-50';
  else if (alertType === 'error') classes = 'border-l-red-400 bg-red-50';
  else classes = 'border-l-yellow-400 bg-yellow-50';

  if (acknowledged === true) classes += ' opacity-50';
  return classes;
}

function SystemAlertItem({ alert, onAcknowledgeAlert }: Readonly<SystemAlertItemProps>) {
  return (
    <div
      className={`p-2 rounded border-l-4 ${getAlertClasses(alert.type, alert.acknowledged)}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={alert.type === 'critical' ? 'destructive' : 'secondary'}>
            {alert.type}
          </Badge>
          <span className="text-sm">{alert.message}</span>
        </div>
        {alert.acknowledged !== true && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onAcknowledgeAlert(alert.id)}
          >
            Acknowledge
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {new Date(alert.timestamp).toLocaleString()}
      </p>
    </div>
  );
}
