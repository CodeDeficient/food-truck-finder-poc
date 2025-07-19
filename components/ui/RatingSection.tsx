
import type { TruckRating } from '@/lib/types';

/**
 * Displays truck ratings and calculates average score.
 * @example
 * renderRatings({ ratings: [{ id: 1, title: 'Service', score: 4.5 }, { id: 2, title: 'Quality', score: 4.0 }] })
 * <div>A rendered ratings breakdown</div>
 * @param {{ ratings: Array<{ id: number, title: string, score: number }> }} ratings - An array of truck ratings, each containing an id, a title, and a score.
 * @returns {JSX.Element} A JSX element displaying the list of ratings with an average score.
 * @description
 *   - Returns a message that no ratings are available if the input array is empty or undefined.
 *   - Calculates the average rating score using all ratings in the array.
 *   - Renders individual ratings dynamically within the returned JSX.
 */
const RatingSection = ({ ratings }: { ratings: TruckRating[] }) => {
  if (ratings.length === 0) return <p>No ratings yet</p>;

  const avgScore = ratings.reduce((total, rating) => total + rating.score, 0) / ratings.length;

  return (
    <div className="rating-container">
      <h3>Ratings Breakdown</h3>
      <div className="average-rating">Average: {avgScore.toFixed(1)}</div>
      {ratings.map(rating => (
        <div key={rating.id} className="individual-rating">
          <p>{rating.title}: {rating.score}</p>
        </div>
      ))}
    </div>
  );
};

export default RatingSection;
