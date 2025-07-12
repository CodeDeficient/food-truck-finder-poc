'use client';


import { CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, RefreshCw } from 'lucide-react';

interface ConnectionStatusHeaderProps {
  readonly isConnected: boolean;
  readonly isConnecting: boolean;
  readonly lastEventTime?: Date;
  readonly connect: () => void;
  readonly disconnect: () => void;
}

/**
 * Renders a status header for a connection management interface.
 * @example
 * ConnectionStatusHeader({
 *   isConnected: true,
 *   isConnecting: false,
 *   lastEventTime: new Date(),
 *   connect: () => {},
 *   disconnect: () => {}
 * })
 * <CardHeader>...</CardHeader>
 * @param {boolean} isConnected - Indicates if the connection is currently active.
 * @param {boolean} isConnecting - Indicates if a connection attempt is in progress.
 * @param {Date | null} lastEventTime - Timestamp of the last connection-related event.
 * @param {function} connect - Function to initiate the connection.
 * @param {function} disconnect - Function to terminate the connection.
 * @returns {JSX.Element} The rendered header component.
 * @description
 *   - Displays real-time connection status with visual indicators.
 *   - Button toggles between 'Connect', 'Disconnect', and 'Connecting...' states.
 *   - Shows last event time if available.
 */
export function ConnectionStatusHeader({
  isConnected,
  isConnecting,
  lastEventTime,
  connect,
  disconnect,
}: Readonly<ConnectionStatusHeaderProps>) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="size-5" />
          Real-time System Status
        </CardTitle>
        <div className="flex items-center gap-2">
          {isConnected && <div className="size-2 bg-green-500 rounded-full animate-pulse" />}
          <Button
            variant="outline"
            size="sm"
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
          >
            <RefreshCw className={`size-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
            {(() => {
              if (isConnected) return 'Disconnect';
              if (isConnecting) return 'Connecting...';
              return 'Connect';
            })()}
          </Button>
        </div>
      </div>
      {lastEventTime && (
        <p className="text-sm text-muted-foreground">
          Last update: {lastEventTime.toLocaleTimeString()}
        </p>
      )}
    </CardHeader>
  );
}
