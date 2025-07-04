import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users } from 'lucide-react';
import type { FoodTruckWithRatings } from '@/hooks/useFoodTruckDetails';

interface TruckRatingsReviewsProps {
  readonly truck: FoodTruckWithRatings;
}

/**
 * Displays a star rating based on the given numerical rating.
 * @example
 * StarRating({ rating: 3 })
 * // Renders a component with 3 yellow stars and 2 gray stars
 * @param {number} rating - Numerical representation of the rating, typically between 0 and 5.
 * @returns {JSX.Element} A JSX element containing a graphical star rating.
 * @description
 *   - Rounds the rating to the nearest whole number for rendering.
 *   - Uses a flexbox layout to display stars horizontally.
 *   - Each star component utilizes conditional styling for filled or outlined appearance.
 *   - Incorporates semantic class names for easy styling customization.
 */
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

/**
 * Displays the ratings and reviews section for a truck.
 * @example
 * TruckRatingsReviews({ truck: { average_rating: 4.5, review_count: 10 } })
 * <ReactElement>
 * @param {TruckRatingsReviewsProps} { truck } - Contains truck information including average rating and review count.
 * @returns {ReactElement | undefined} Returns a React element containing the ratings and reviews UI or undefined if average_rating is not present.
 * @description
 *   - Conditionally displays review count if it is defined.
 *   - Integrates with styled components to apply dark mode styling.
 *   - Utilizes helper sub-components like StarRating, Card, Users, etc., for structured UI.
 */
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
