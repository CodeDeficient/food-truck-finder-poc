'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface EventControlsProps {
  readonly recentEventsCount: number;
  readonly onClearEvents: () => void;
}

export function EventControls({ recentEventsCount, onClearEvents }: Readonly<EventControlsProps>) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onClearEvents}
        disabled={recentEventsCount === 0}
      >
        Clear Events ({recentEventsCount})
      </Button>
      <Badge variant="secondary">{recentEventsCount} events in buffer</Badge>
    </div>
  );
}
