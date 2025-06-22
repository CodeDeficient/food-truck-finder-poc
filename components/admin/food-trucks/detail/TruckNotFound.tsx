import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export function TruckNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h1 className="text-2xl font-bold text-gray-900">Food Truck Not Found</h1>
      <p className="text-gray-600 mt-2">The requested food truck could not be found.</p>
      <Button asChild className="mt-4">
        <Link href="/admin/food-trucks">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Food Trucks
        </Link>
      </Button>
    </div>
  );
}
