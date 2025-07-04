import React, { useEffect, useState } from 'react';
import { Truck } from '@/lib/types'; // Import from actual types file
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
  const [trucks, setTrucks] = useState<Truck[]>([]);

  useEffect(() => {
    // Placeholder: Integrate actual truck loading logic here
    setTrucks([
      // Temporary data - replace with real query
      { id: 1, name: "Temp Truck 1" },
      { id: 2, name: "Temp Truck 2" }
    ]);
  }, []);

  return (
    <div className="trucks-container">
      {trucks.length > 0 ? (
        trucks.map(truck => <TruckCard key={truck.id} truck={truck} />)
      ) : (
        <p>Loading trucks...</p>
      )}
    </div>
  );
}

export default TrucksPage;
