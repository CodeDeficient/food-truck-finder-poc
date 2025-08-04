'use client';

import { useEffect, useState } from 'react';
import type { FoodTruck } from '@/lib/types';
import { TruckCard } from '@/components/TruckCard';
import { getSupabase } from '@/lib/supabase';

export default function TrucksPage() {
  const [trucks, setTrucks] = useState<FoodTruck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrucks = async () => {
      const supabase = getSupabase();
      const { data, error: fetchError } = await supabase
        .from('food_trucks')
        .select('*');

      if (fetchError) {
        console.error('Error fetching trucks:', fetchError);
        setError('Failed to load trucks. Please try again later.');
      } else {
        setTrucks(data || []);
      }
      setLoading(false);
    };

    fetchTrucks();
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading trucks...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {trucks.map(truck => (
                <TruckCard key={truck.id} truck={truck} isOpen={false} onSelectTruck={() => {}} />
      ))}
    </div>
  );
}