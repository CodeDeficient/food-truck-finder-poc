import React, { useEffect, useState } from 'react';
import TruckCard from '@/components/ui/TruckCard';
import { FoodTruck } from '@/lib/types'; // Import from actual types file


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
    setTrucks([
      // Temporary data - replace with real query
      { id: "1", name: "Temp Truck 1", cuisine_type: ["American"], price_range: "$", data_quality_score: 0, verification_status: "pending", source_urls: [], last_scraped_at: "", current_location: { lat: 0, lng: 0, address: "", timestamp: "" }, operating_hours: { monday: { closed: true }, tuesday: { closed: true }, wednesday: { closed: true }, thursday: { closed: true }, friday: { closed: true }, saturday: { closed: true }, sunday: { closed: true } }, menu: [], contact_info: {}, social_media: {}, created_at: "", updated_at: "", description: "", specialties: [], scheduled_locations: [] },
      { id: "2", name: "Temp Truck 2", cuisine_type: ["Mexican"], price_range: "$", data_quality_score: 0, verification_status: "pending", source_urls: [], last_scraped_at: "", current_location: { lat: 0, lng: 0, address: "", timestamp: "" }, operating_hours: { monday: { closed: true }, tuesday: { closed: true }, wednesday: { closed: true }, thursday: { closed: true }, friday: { closed: true }, saturday: { closed: true }, sunday: { closed: true } }, menu: [], contact_info: {}, social_media: {}, created_at: "", updated_at: "", description: "", specialties: [], scheduled_locations: [] }
    ]);
  }, []);

  return (
    <div className="trucks-container">
      {trucks.length > 0 ? (
        trucks.map(truck => <TruckCard key={truck.id} title={truck.name} price={truck.price_range ?? ''} reviews={truck.review_count ?? 0} image_url={truck.image_url ?? '/placeholder-logo.png'} rating={truck.average_rating ?? 0} />)
      ) : (
        <p>Loading trucks...</p>
      )}
    </div>
  );
}

export default TrucksPage;
