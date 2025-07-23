import { Star } from 'lucide-react';
/**
 * Renders a rating section displaying average rating and review count if available.
 * @example
 * RatingSection({ averageRating: 4.3, reviewCount: 123 })
 * <div>...</div>
 * @param {Readonly<RatingSectionProps>} props - The props contain averageRating and reviewCount to render.
 * @returns {JSX.Element} A JSX element displaying a star rating and review count.
 * @description
 *   - The function returns nothing if averageRating is undefined.
 *   - Renders star icons representing the average rating.
 *   - Displays the average rating rounded to one decimal place.
 *   - Shows review count only when it is defined.
 */
export function RatingSection({ averageRating, reviewCount }) {
    if (averageRating === undefined)
        return;
    return (<div>
      <h4 className="font-medium mb-2 text-sm dark:text-gray-100">Rating</h4>
      <div className="flex items-center gap-2">
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (<Star key={star} className={`size-4 ${star <= Math.round(averageRating ?? 0)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'}`}/>))}
        </div>
        <span className="text-sm font-medium dark:text-gray-200">{averageRating.toFixed(1)}</span>
        {reviewCount !== undefined && (<span className="text-xs text-gray-500 dark:text-gray-400">({reviewCount} reviews)</span>)}
      </div>
    </div>);
}
