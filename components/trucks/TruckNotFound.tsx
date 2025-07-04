import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Renders a 'Food Truck Not Found' message to the user in a container.
 * @example
 * TruckNotFound()
 * <div> element containing a message and a button link to the map
 * @returns {JSX.Element} JSX component displaying a message and a navigation link.
 * @description
 *   - Displays a message indicating the requested food truck is not found.
 *   - Includes a button with a link to navigate back to the main map view.
 *   - Applies conditional styling based on light or dark mode.
 */
export function TruckNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Food Truck Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            The requested food truck could not be found.
          </p>
          <Button asChild className="mt-4">
            <Link href="/">
              <ArrowLeft className="size-4 mr-2" />
              Back to Map
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
