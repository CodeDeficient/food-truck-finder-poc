import React from 'react';
import { Button } from '@/components/ui/button';

interface AlertToggleButtonProps {
  readonly alertsLength: number;
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
}

export function AlertToggleButton({ alertsLength, showDetails, onToggleDetails }: AlertToggleButtonProps) {
  if (alertsLength <= 3) return null;

  return (
    <Button
      variant="outline"
      size="sm"
      className="mt-2"
      onClick={onToggleDetails}
    >
      {showDetails ? 'Hide' : 'Show'} {alertsLength - 3} more alerts
    </Button>
  );
}
