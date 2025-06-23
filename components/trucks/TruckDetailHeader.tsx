import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface TruckDetailHeaderProps {
  readonly truckName: string;
}

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
