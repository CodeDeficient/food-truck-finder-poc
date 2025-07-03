import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users } from 'lucide-react';
import type { FoodTruckWithRatings } from '@/hooks/useFoodTruckDetails';

interface TruckRatingsReviewsProps {
  readonly truck: FoodTruckWithRatings;
}

function StarRating({ rating }: Readonly<{ rating: number }>) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-6 w-6 ${
            star <= Math.round(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export function TruckRatingsReviews({ truck }: TruckRatingsReviewsProps) {
  if (truck.average_rating === undefined) {
    return;
  }

  return (
    <Card className="dark:bg-slate-800 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Star className="h-5 w-5" />
          Ratings & Reviews
        </CardTitle>
        <CardDescription className="dark:text-gray-400">Customer feedback</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <StarRating rating={truck.average_rating} />
            <span className="text-xl font-semibold dark:text-gray-100">
              {truck.average_rating.toFixed(1)}
            </span>
          </div>
          {truck.review_count !== undefined && (
            <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
              <Users className="h-4 w-4" />
              <span className="text-sm">{truck.review_count} reviews</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
