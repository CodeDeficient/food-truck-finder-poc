import React from 'react';

export interface TruckCardProps {
  title: string;
  price: string;
  reviews: number;
  image_url: string;
  rating: number;
}

export default function TruckCard({ title, price, reviews, image_url, rating }: Readonly<TruckCardProps>) {
  return (
    <div className="bg-white p-4 rounded-md">
      <img src={image_url} alt={title} className="mb-3"/>
      <h3>{title}</h3>
      <p className="text-gray-800">${price}</p>
      <p>Rating: {rating} based on {reviews} reviews</p>
    </div>
  );
}
