import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users } from 'lucide-react';

import { type FoodTruck } from '@/lib/supabase';

interface RatingsReviewsCardProps {
  readonly truck: FoodTruck;
}

export function RatingsReviewsCard({ truck }: RatingsReviewsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Ratings & Reviews
        </CardTitle>
        <CardDescription>Customer feedback and ratings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {truck.average_rating === undefined ? (
          <p className="text-gray-400 text-sm">No ratings available</p>
        ) : (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= Math.round(truck.average_rating ?? 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-lg font-semibold">
                {(truck.average_rating ?? 0).toFixed(1)}
              </span>
            </div>
            {truck.review_count !== undefined && (
              <div className="flex items-center gap-1 text-gray-600">
                <Users className="h-4 w-4" />
                <span className="text-sm">{truck.review_count} reviews</span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
