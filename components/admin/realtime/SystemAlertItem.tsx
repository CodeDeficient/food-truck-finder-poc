'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { type SystemAlert } from '@/hooks/useSystemAlerts';

interface SystemAlertItemProps {
  readonly alert: SystemAlert;
  readonly onAcknowledgeAlert: (id: string) => void;
}

/**
 * Returns a style string based on the type and acknowledgment status.
 * @example
 * getAlertStyle('info', false)
 * 'border-blue-500 bg-blue-50 text-blue-800'
 * @param {('info'|'warning'|'error'|'critical')} type - Type of the alert.
 * @param {boolean | undefined} acknowledged - Whether the alert has been acknowledged.
 * @returns {string} Style string for the alert item.
 * @description
 *   - If `acknowledged` is true, returns generic gray style irrelevant of the type.
 *   - Specific styles are used for different alert `type` values.
 *   - Defaults to gray style if an unrecognized `type` is passed.
 */
const getAlertClasses = (
  type: 'info' | 'warning' | 'error' | 'critical',
  acknowledged: boolean | undefined,
) => {
  if (acknowledged === true) {
    return 'border-gray-300 bg-gray-50 text-gray-500';
  }
  switch (type) {
    case 'info': {
      return 'border-blue-500 bg-blue-50 text-blue-800';
    }
    case 'warning': {
      return 'border-yellow-500 bg-yellow-50 text-yellow-800';
    }
    case 'error': {
      return 'border-red-500 bg-red-50 text-red-800';
    }
    case 'critical': {
      return 'border-red-700 bg-red-100 text-red-900 font-bold';
    }
    default: {
      return 'border-gray-300 bg-gray-50 text-gray-800';
    }
  }
};

/**
 * Renders a system alert item.
 * @example
 * SystemAlertItem({ alert: { type: 'warning', message: 'Low disk space', acknowledged: false, id: '1', timestamp: 1633065600000 }, onAcknowledgeAlert: function() { /* handle acknowledgment */
export function SystemAlertItem({ alert, onAcknowledgeAlert }: Readonly<SystemAlertItemProps>) {
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
          <Button variant="ghost" size="sm" onClick={() => onAcknowledgeAlert(alert.id)}>
            Acknowledge
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500 mt-1">{new Date(alert.timestamp).toLocaleString()}</p>
    </div>
  );
}
