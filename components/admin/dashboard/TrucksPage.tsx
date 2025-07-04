import React, { useEffect, useState } from 'react';
import { Truck } from '@/lib/types'; // Import from actual types file
import TruckCard from '@/components/ui/TruckCard';

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
