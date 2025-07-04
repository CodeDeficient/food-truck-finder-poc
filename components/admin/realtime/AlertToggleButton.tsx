import React from 'react';
import { Button } from '@/components/ui/button';

interface AlertToggleButtonProps {
  readonly alertsLength: number;
  readonly showDetails: boolean;
  readonly onToggleDetails: () => void;
}

/**
 * Toggle the display of additional alerts beyond a certain threshold.
 * @example
 * AlertToggleButton({ alertsLength: 7, showDetails: false, onToggleDetails: handleToggle })
 * Button showing "Show 4 more alerts"
 * @param {number} alertsLength - The total number of alerts available.
 * @param {boolean} showDetails - Flag indicating whether additional alerts are currently shown or hidden.
 * @param {function} onToggleDetails - Callback function to toggle the visibility of additional alerts.
 * @returns {JSX.Element} Button element for toggling the visibility of alerts.
 * @description
 *   - The function does not render a button if the number of alerts is less than or equal to 3.
 *   - The button label dynamically changes based on the current visibility state and the number of alerts beyond the initial 3.
 *   - Designed to work with a specific variant and size within the application's styling context.
 */
export function AlertToggleButton({
  alertsLength,
  showDetails,
  onToggleDetails,
}: AlertToggleButtonProps) {
  if (alertsLength <= 3) return;

  return (
    <Button variant="outline" size="sm" className="mt-2" onClick={onToggleDetails}>
      {showDetails ? 'Hide' : 'Show'} {alertsLength - 3} more alerts
    </Button>
  );
}
