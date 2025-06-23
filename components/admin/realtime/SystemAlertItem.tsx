'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type SystemAlert, getAlertClasses } from './status-helpers'; // Revert to no .tsx extension

interface SystemAlertItemProps {
  alert: SystemAlert;
  onAcknowledgeAlert: (id: string) => void;
}

export function SystemAlertItem({ alert, onAcknowledgeAlert }: SystemAlertItemProps) {
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
