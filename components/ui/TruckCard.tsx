

import Image from 'next/image';

export interface TruckCardProps {
  title: string;
  price: string;
  reviews: number;
  image_url: string;
  rating: number;
}

export default function TruckCard({ title, price, reviews, image_url, rating }: Readonly<TruckCardProps>) {
  // Adjust Image component with proper width & height - replace static values with dynamic calculation if needed
  const imageWidth = 200; // Example width
  const imageHeight = 150; // Example height
  return (
    <div className="bg-white p-4 rounded-md">
      <Image
        src={image_url}
        alt={title}
        width={imageWidth}
        height={imageHeight}
        className="mb-3"
      />
      <h3>{title}</h3>
      <p className="text-gray-800">${price}</p>
      <p>Rating: {rating} based on {reviews} reviews</p>
    </div>
  );
}
