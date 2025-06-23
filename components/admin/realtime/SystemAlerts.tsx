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

export function SystemAlerts({ alerts, showDetails, onToggleDetails, onAcknowledgeAlert }: SystemAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Alerts</h4>
      <div className="space-y-2">
        {alerts.slice(0, 3).map((alert) => (
          <div
            key={alert.id}
            className={`p-2 rounded border-l-4 ${(() => {
              if (alert.type === 'critical') return 'border-l-red-500 bg-red-50';
              if (alert.type === 'error') return 'border-l-red-400 bg-red-50';
              return 'border-l-yellow-400 bg-yellow-50';
            })()} ${alert.acknowledged === true ? 'opacity-50' : ''}`}
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
