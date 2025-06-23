'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type SystemAlert } from './StatusHelpers';

interface SystemAlertItemProps {
  readonly alert: SystemAlert;
  readonly onAcknowledgeAlert: (id: string) => void;
}

export function SystemAlertItem({ alert, onAcknowledgeAlert }: Readonly<SystemAlertItemProps>) {
  const getAlertClasses = (type: 'warning' | 'error' | 'critical', acknowledged: boolean) => {
    if (acknowledged) {
      return 'border-gray-300 bg-gray-50 text-gray-500';
    }
    switch (type) {
      case 'warning':
        return 'border-yellow-500 bg-yellow-50 text-yellow-800';
      case 'error':
        return 'border-red-500 bg-red-50 text-red-800';
      case 'critical':
        return 'border-red-700 bg-red-100 text-red-900 font-bold';
      default:
        return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  };

  return (
    <div className={`p-2 rounded border-l-4 ${getAlertClasses(alert.type, alert.acknowledged)}`}>
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
