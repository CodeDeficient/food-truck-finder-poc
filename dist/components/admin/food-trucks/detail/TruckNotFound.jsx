import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
/**
 * Displays a message indicating that the requested food truck could not be found.
 * @example
 * TruckNotFound()
 * <div className="flex flex-col items-center ...">...</div>
 * @returns {JSX.Element} A JSX element containing the "Not Found" message and a link to go back to the food trucks list.
 * @description
 *   - Utilizes Tailwind CSS classes for styling.
 *   - Includes navigation back to the food trucks page via a button.
 *   - Applies flexbox properties to center content vertically and horizontally.
 */
export function TruckNotFound() {
    return (<div className="flex flex-col items-center justify-center min-h-[400px]">
      <h1 className="text-2xl font-bold text-gray-900">Food Truck Not Found</h1>
      <p className="text-gray-600 mt-2">The requested food truck could not be found.</p>
      <Button asChild className="mt-4">
        <Link href="/admin/food-trucks">
          <ArrowLeft className="size-4 mr-2"/>
          Back to Food Trucks
        </Link>
      </Button>
    </div>);
}
