import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Users } from 'lucide-react';
import {} from '@/lib/supabase';
/**
 * This component renders a card displaying ratings and reviews for a food truck.
 * @example
 * RatingsReviewsCard({ truck: { average_rating: 4.5, review_count: 20 } })
 * Returns a card component with rating stars and review count.
 * @param {Object} truck - The truck object containing average rating and review count.
 * @returns {JSX.Element} A card component showing customer ratings and reviews.
 * @description
 *   - Displays star ratings based on the average rating value from the truck object.
 *   - Shows the number of reviews if available.
 *   - Handles cases where there are no ratings available.
 */
export function RatingsReviewsCard({ truck }) {
    var _a;
    return (<Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="size-5"/>
          Ratings & Reviews
        </CardTitle>
        <CardDescription>Customer feedback and ratings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {truck.average_rating === undefined ? (<p className="text-gray-400 text-sm">No ratings available</p>) : (<div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => {
                var _a;
                return (<Star key={star} className={`size-5 ${star <= Math.round((_a = truck.average_rating) !== null && _a !== void 0 ? _a : 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'}`}/>);
            })}
              </div>
              <span className="text-lg font-semibold">
                {((_a = truck.average_rating) !== null && _a !== void 0 ? _a : 0).toFixed(1)}
              </span>
            </div>
            {truck.review_count !== undefined && (<div className="flex items-center gap-1 text-gray-600">
                <Users className="size-4"/>
                <span className="text-sm">{truck.review_count} reviews</span>
              </div>)}
          </div>)}
      </CardContent>
    </Card>);
}
