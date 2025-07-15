
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { FoodTruck } from '@/lib/types';

interface TruckCardFooterProps {
  readonly truck: FoodTruck;
}

/**
 * Renders a footer component for the truck card, including action buttons for viewing details and booking.
 * @example
 * TruckCardFooter({ truck: { id: '123', verification_status: 'verified' } })
 * Returns rendered JSX element of the footer with buttons.
 * @param {object} truck - The truck object containing details like ID and verification status.
 * @returns {JSX.Element} JSX code for rendering the footer component within the truck card.
 * @description
 *   - Displays a "View Details" button that links to the truck's detail page.
 *   - The "Book Me" button is only displayed if the truck's verification status is 'verified'.
 *   - Ensures correct styling by using predefined CSS classes.
 */
export function TruckCardFooter({ truck }: TruckCardFooterProps) {
  return (
    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex gap-2">
        <Button asChild className="flex-1" variant="outline">
          <Link href={`/trucks/${truck.id}`}>
            <Eye className="size-4 mr-2" />
            View Details
          </Link>
        </Button>
        {truck.verification_status === 'verified' && (
          <Button className="flex-1" variant="default" disabled>
            Book Me
          </Button>
        )}
      </div>
    </div>
  );
}
