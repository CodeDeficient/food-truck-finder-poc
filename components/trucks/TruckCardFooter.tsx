import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import Link from 'next/link';
import { FoodTruck } from '@/lib/types/foodTruck';

interface TruckCardFooterProps {
  readonly truck: FoodTruck;
}

export function TruckCardFooter({ truck }: TruckCardFooterProps) {
  return (
    <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
      <div className="flex gap-2">
        <Button asChild className="flex-1" variant="outline">
          <Link href={`/trucks/${truck.id}`}>
            <Eye className="h-4 w-4 mr-2" />
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
