'use client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
/**
 * Render event control buttons and badge.
 * @example
 * EventControls({ recentEventsCount: 5, onClearEvents: () => clearAllEvents() })
 * <div className="mt-4 flex items-center gap-2">
 *   <Button>Clear Events (5)</Button>
 *   <Badge>5 events in buffer</Badge>
 * </div>
 * @param {Readonly<EventControlsProps>} {recentEventsCount, onClearEvents} - Recent events count and the callback to clear events.
 * @returns {JSX.Element} JSX for buttons and badge displaying event controls.
 * @description
 *   - Disables the "Clear Events" button when there are no recent events.
 *   - Uses Tailwind CSS classes for styling layout and behavior.
 */
export function EventControls({ recentEventsCount, onClearEvents }) {
    return (<div className="mt-4 flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={onClearEvents} disabled={recentEventsCount === 0}>
        Clear Events ({recentEventsCount})
      </Button>
      <Badge variant="secondary">{recentEventsCount} events in buffer</Badge>
    </div>);
}
