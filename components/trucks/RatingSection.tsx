import React from 'react';
import { Star } from 'lucide-react';

interface RatingSectionProps {
  readonly averageRating?: number;
  readonly reviewCount?: number;
}

export function RatingSection({ averageRating, reviewCount }: Readonly<RatingSectionProps>) {
  if (averageRating === undefined) return null;

  return (
    <div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Rating</h4>
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= Math.round(averageRating ?? 0)
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm font-medium dark:text-gray-200">
          {averageRating.toFixed(1)}
        </span>
        {(reviewCount !== undefined) && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            ({reviewCount} reviews)
          </span>
        )}
      </div>
    </div>
  );
}
