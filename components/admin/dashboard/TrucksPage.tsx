import React, { useEffect, useState } from 'react';
import { FoodTruck } from '@/lib/types'; // Import from actual types file
import TruckCard from '@/components/ui/TruckCard';

/**
* Loads and displays a list of trucks on the dashboard.
* @example
* TrucksPage()
* Returns a container with truck cards or a loading message.
* @returns {JSX.Element} A container with truck cards or a loading message.
* @description
*   - Uses temporary truck data, which should be replaced with real truck loading logic.
*   - Employs useState to manage the array of trucks.
*   - Displays 'Loading trucks...' message when truck data is unavailable.
*/
const TrucksPage = () => {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);

  useEffect(() => {
    // Placeholder: Integrate actual truck loading logic here
    // This temporary data needs to align with the FoodTruck type for real usage
    setTrucks([
      // Temporary data - replace with real query
      { id: '1', name: 'Temp Truck 1', cuisine_type: ['Tacos'], data_quality_score: 80, verification_status: 'verified', source_urls: [], last_scraped_at: new Date().toISOString(), operating_hours: {} as any, menu: [], contact_info: {}, social_media: {}, current_location: {lat:0,lng:0,address:'',timestamp:''}, scheduled_locations: [], specialties: [], price_range: '$$', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: '2', name: 'Temp Truck 2', cuisine_type: ['Burgers'], data_quality_score: 90, verification_status: 'verified', source_urls: [], last_scraped_at: new Date().toISOString(), operating_hours: {} as any, menu: [], contact_info: {}, social_media: {}, current_location: {lat:0,lng:0,address:'',timestamp:''}, scheduled_locations: [], specialties: [], price_range: '$', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ] as FoodTruck[]);
  }, []);

  return (
    <div className="trucks-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {trucks.length > 0 ? (
        trucks.map(truck => (
          <TruckCard
            key={truck.id}
            title={truck.name}
            price={truck.price_range || 'N/A'} // Or derive from menu
            reviews={truck.review_count || 0}
            image_url={truck.social_media?.instagram_profile_pic_url || truck.source_urls?.[0] || '/placeholder.jpg'} // Placeholder
            rating={truck.average_rating || 0}
          />
        ))
      ) : (
        <p>Loading trucks...</p>
      )}
    </div>
  );
}

export default TrucksPage;
