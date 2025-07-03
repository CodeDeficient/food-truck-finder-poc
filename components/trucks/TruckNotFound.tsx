import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Map
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
