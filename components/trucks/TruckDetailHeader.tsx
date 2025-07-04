import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TruckDetailHeaderProps {
  readonly truckName: string;
}

/**
* Renders the header section for a food truck's detail page.
* @example
* TruckDetailHeader({ truckName: 'Tasty Treats' })
* <div> ... </div>
* @param {object} TruckDetailHeaderProps - Contains properties required by the TruckDetailHeader component.
* @returns {JSX.Element} A React component rendering the truck detail header layout.
* @description
*   - The header includes a button linking back to the main map page.
*   - Displays the provided truck name prominently with additional descriptive text.
*   - Incorporates responsive and accessible design using semantic HTML and CSS utility classes.
*   - Utilizes React Router's Link component for navigation within the application.
*/
export function TruckDetailHeader({ truckName }: TruckDetailHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Map
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight dark:text-gray-100">{truckName}</h1>
          <p className="text-muted-foreground dark:text-gray-400">
            Food truck details and information
          </p>
        </div>
      </div>
    </div>
  );
}
