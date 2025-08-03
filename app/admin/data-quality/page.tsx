
import { FoodTruckService, supabase, type FoodTruck } from '@/lib/supabase';
import { DataQualityDashboard } from '@/components/admin/data-quality/DataQualityDashboard';

// Define the data quality stats type based on the database function
interface DataQualityStats {
  total_trucks: number;
  avg_quality_score: number;
  high_quality_count: number;
  medium_quality_count: number;
  low_quality_count: number;
  verified_count: number;
  pending_count: number;
  flagged_count: number;
}


/**
 * Render the Data Quality Page with truck data and quality stats visualizations.
 * @example
 * DataQualityPage()
 * Returns a React component representing the data quality page.
 * @returns {JSX.Element} A React component rendering the data quality page layout.
 * @description
 *   - Fetches the first 1000 food trucks using FoodTruckService for comprehensive data.
 *   - Utilizes Supabase to fetch data quality statistics through a remote procedure call.
 *   - Displays error message if fetching data quality stats encounters an error.
 *   - Renders the enhanced DataQualityDashboard component with all required features.
 */
export default async function DataQualityPage() {
  const { trucks } = await FoodTruckService.getAllTrucks(1000, 0); // Fetch up to 1000 trucks

  // Fetch data quality stats using the Supabase function
  const { data: qualityStatsResult, error: qualityError } = await supabase
    .rpc('get_data_quality_stats')
    .single();

  if (qualityError != undefined) {
    console.error('Error fetching data quality stats:', qualityError);
  }

  const dataQualityStats: DataQualityStats = (qualityStatsResult as DataQualityStats) ?? {
    total_trucks: 0,
    avg_quality_score: 0,
    high_quality_count: 0,
    medium_quality_count: 0,
    low_quality_count: 0,
    verified_count: 0,
    pending_count: 0,
    flagged_count: 0,
  };

  return (
    <DataQualityDashboard 
      initialTrucks={trucks}
      qualityStats={dataQualityStats}
    />
  );
}
