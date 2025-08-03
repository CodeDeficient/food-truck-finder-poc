
import { FoodTruckService, supabase, type FoodTruck } from '@/lib/supabase';
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Badge, Button, Edit, BarChart3, Link,
  dynamic
} from '@/lib/admin/shared-admin-imports';

export { dynamic };
import { DataQualityCharts } from '@/components/ui/dataQualityCharts';
import { SimpleQualityPanel } from '@/components/ui/SimpleQualityPanel';
import {
  formatQualityScore,
  categorizeQualityScore,
  getQualityBadgeClasses,
  getQualityScoreAriaLabel,
  type QualityCategory,
} from '@/lib/utils/QualityScorer';

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

// Page header component
/**
 * Renders the page header for data quality management section.
 * @example
 * PageHeader()
 * Returns the JSX component for the header, containing a title and a button linking to reports.
 * @returns {JSX.Element} The JSX markup for the page header.
 * @description
 *   - Integrates a responsive layout with flexbox utilities for alignment.
 *   - "View Reports" button uses variant styling and links to a specific report page.
 */
function PageHeader() {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Data Quality Management</h1>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href="/admin/data-quality/reports">
            <BarChart3 className="size-4 mr-2" />
            View Reports
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Food truck quality table component
/**
 * Generates a table displaying food truck data quality details
 * @example
 * FoodTruckQualityTable({ trucks: sampleTrucksArray })
 * <Card>...</Card>
 * @param {FoodTruck[]} trucks - An array of FoodTruck objects to display.
 * @returns {JSX.Element} A JSX element containing the rendered table.
 * @description
 *   - Displays card with header, content, and table components.
 *   - Sorts trucks by quality score with lowest scores first.
 *   - Provides actions for each row to manage food truck data.
 */
function FoodTruckQualityTable({ trucks }: { readonly trucks: FoodTruck[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Food Truck Data Quality Details</CardTitle>
        <CardDescription>
          Review and manage individual food truck data quality scores. Trucks are sorted by quality
          score (lowest first for priority review).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Verification Status</TableHead>
              <TableHead>Quality Score</TableHead>
              <TableHead>Quality Category</TableHead>
              <TableHead>Last Scraped</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trucks.map((truck: FoodTruck) => (
              <FoodTruckQualityRow key={truck.id} truck={truck} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Food truck quality table row component
/**
* Renders a quality information row for a given food truck within a table.
* @example
* FoodTruckQualityRow({ truck: sampleTruck })
* JSX representing a table row with quality indicators for the sample food truck.
* @param {Object} truck - The food truck object containing quality and verification information.
* @returns {JSX.Element} A table row displaying various quality metrics and actions related to the food truck.
* @description
*   - Utilizes helper functions to derive CSS classes, ARIA labels, and categorization labels based on quality score.
*   - Handles undefined last scraped date by displaying 'N/A'.
*   - Provides an action button linking to the review page for detailed inspection.
*/
function FoodTruckQualityRow({ truck }: { readonly truck: FoodTruck }) {
  const qualityCategory: QualityCategory = categorizeQualityScore(truck.data_quality_score ?? 0);

  const badgeClasses: string = getQualityBadgeClasses(truck.data_quality_score ?? 0);

  const ariaLabel: string = getQualityScoreAriaLabel(truck.data_quality_score ?? 0);

  return (
    <TableRow>
      <TableCell className="font-medium">{truck.name}</TableCell>
      <TableCell>
        <Badge variant={truck.verification_status === 'verified' ? 'default' : 'outline'}>
          {truck.verification_status}
        </Badge>
      </TableCell>
      <TableCell>
        <span aria-label={ariaLabel}>
          {}
          {formatQualityScore(truck.data_quality_score)}
        </span>
      </TableCell>
      <TableCell>
        <Badge className={badgeClasses}>
          {}
          {qualityCategory.label}
        </Badge>
      </TableCell>
      <TableCell>
        {truck.last_scraped_at == undefined
          ? 'N/A'
          : new Date(truck.last_scraped_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <Button asChild>
          <Link href={`/admin/food-trucks/${truck.id}`}>
            <Edit className="size-4 mr-2" />
            Review
          </Link>
        </Button>
      </TableCell>
    </TableRow>
  );
}

/**
 * Render the Data Quality Page with truck data and quality stats visualizations.
 * @example
 * DataQualityPage()
 * Returns a React component representing the data quality page.
 * @returns {JSX.Element} A React component rendering the data quality page layout.
 * @description
 *   - Fetches the first 100 food trucks using FoodTruckService for initial data.
 *   - Utilizes Supabase to fetch data quality statistics through a remote procedure call.
 *   - Displays error message if fetching data quality stats encounters an error.
 *   - Sorts trucks by their data quality score for easy review, with lowest scores first.
 */
export default async function DataQualityPage() {
  const { trucks } = await FoodTruckService.getAllTrucks(100, 0); // Fetch first 100 trucks

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

  // Sort trucks by data quality score (lowest first for review)
  const sortedTrucks = [...trucks].sort(
    (a: FoodTruck, b: FoodTruck) => (a.data_quality_score ?? 0) - (b.data_quality_score ?? 0),
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader />

      {/* Data Quality Charts Section */}
      <DataQualityCharts qualityStats={dataQualityStats} />

      {/* Quality Management Panel */}
      <SimpleQualityPanel />

      <FoodTruckQualityTable trucks={sortedTrucks} />
    </div>
  );
}
