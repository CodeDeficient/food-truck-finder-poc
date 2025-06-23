'use client';

import React from 'react';
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

export function ConnectionStatusHeader({
  isConnected,
  isConnecting,
  lastEventTime,
  connect,
  disconnect
}: Readonly<ConnectionStatusHeaderProps>) {
  return (
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Real-time System Status
        </CardTitle>
        <div className="flex items-center gap-2">
          {isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isConnecting ? 'animate-spin' : ''}`} />
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
