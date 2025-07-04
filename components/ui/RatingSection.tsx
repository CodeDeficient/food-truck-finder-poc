import React from 'react';
import { TruckRating } from '@/lib/types';

const RatingSection = ({ ratings }: { ratings: TruckRating[] }) => {
  if (!ratings || ratings.length === 0) return <p>No ratings yet</p>;

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
