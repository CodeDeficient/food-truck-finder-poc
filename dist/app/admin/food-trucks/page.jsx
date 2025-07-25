import { FoodTruckService } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
// Page header component
/**
 * Returns a JSX element representing the page header for the Food Truck Management administration section.
 * @example
 * PageHeader()
 * <div className="flex items-center justify-between">...</div>
 * @returns {JSX.Element} A JSX element containing the page title and "Add Food Truck" button.
 * @description
 *   - Utilizes Tailwind CSS classes for styling and layout.
 *   - Renders a button linking to the "new food truck" creation page.
 *   - Adds an icon inside the button for visual enhancement.
 */
function PageHeader() {
    return (<div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Food Truck Management</h1>
      <Button asChild>
        <Link href="/admin/food-trucks/new">
          <PlusCircle className="size-4 mr-2"/>
          Add Food Truck
        </Link>
      </Button>
    </div>);
}
// Quality score helper functions
function getQualityScoreVariant(score) {
    if (score >= 0.8)
        return 'default';
    if (score >= 0.6)
        return 'secondary';
    return 'destructive';
}
function getQualityScoreLabel(score) {
    if (score >= 0.8)
        return 'High';
    if (score >= 0.6)
        return 'Medium';
    return 'Low';
}
// Food truck table row component
/**
 * Renders a table row for displaying food truck information.
 * @example
 * FoodTruckTableRow({ truck })
 * Returns a JSX element representing a table row with food truck info.
 * @param {Object} truck - Contains information about the food truck to be displayed.
 * @returns {JSX.Element} A table row with cells displaying food truck details like name, contact info, cuisine, etc.
 * @description
 *   - Displays contact info only when available; otherwise, shows a 'No contact info' message.
 *   - Formats and shows a quality score as a percentage with an associated badge.
 *   - Includes an "Edit" button linking to the food truck's admin page.
 */
function FoodTruckTableRow({ truck }) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    const qualityScore = (_a = truck.data_quality_score) !== null && _a !== void 0 ? _a : 0;
    return (<TableRow>
      <TableCell className="font-medium">{truck.name}</TableCell>
      <TableCell>
        <div className="space-y-1">
          {((_b = truck.contact_info) === null || _b === void 0 ? void 0 : _b.phone) !== undefined && (<div className="text-sm">📞 {truck.contact_info.phone}</div>)}
          {((_c = truck.contact_info) === null || _c === void 0 ? void 0 : _c.email) !== undefined && (<div className="text-sm">✉️ {truck.contact_info.email}</div>)}
          {((_d = truck.contact_info) === null || _d === void 0 ? void 0 : _d.website) !== undefined && (<div className="text-sm">🌐 {truck.contact_info.website}</div>)}
          {((_e = truck.contact_info) === null || _e === void 0 ? void 0 : _e.phone) === undefined &&
            ((_f = truck.contact_info) === null || _f === void 0 ? void 0 : _f.email) === undefined &&
            ((_g = truck.contact_info) === null || _g === void 0 ? void 0 : _g.website) === undefined && (<span className="text-muted-foreground">No contact info</span>)}
        </div>
      </TableCell>
      <TableCell>{(_j = (_h = truck.cuisine_type) === null || _h === void 0 ? void 0 : _h.join(', ')) !== null && _j !== void 0 ? _j : 'N/A'}</TableCell>
      <TableCell>
        <Badge variant={truck.verification_status === 'verified' ? 'default' : 'outline'}>
          {truck.verification_status}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{(qualityScore * 100).toFixed(0)}%</span>
          <Badge variant={getQualityScoreVariant(qualityScore)} className="text-xs">
            {getQualityScoreLabel(qualityScore)}
          </Badge>
        </div>
      </TableCell>
      <TableCell>
        {truck.last_scraped_at == undefined
            ? 'N/A'
            : new Date(truck.last_scraped_at).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <Button asChild>
          <Link href={`/admin/food-trucks/${truck.id}`}>Edit</Link>
        </Button>
      </TableCell>
    </TableRow>);
}
// Food trucks table component
/**
 * Displays a table of food trucks with detailed information
 * @example
 * FoodTrucksTable({ trucks: [{ id: 1, name: 'Truck 1' }], total: 10 })
 * // Returns a JSX element rendering the table
 * @param {{readonly trucks: FoodTruck[], readonly total: number}} props - An object containing an array of food trucks and the total count of trucks.
 * @returns {JSX.Element} A React component that displays a table of food trucks.
 * @description
 *   - Renders a table inside a card layout to manage food truck details.
 *   - Shows various attributes like Name, Contact, and Cuisine of each food truck.
 *   - Maps through the trucks array to create a row for each food truck using the FoodTruckTableRow component.
 *   - Provides a descriptive header highlighting the total count of food trucks.
 */
function FoodTrucksTable({ trucks, total, }) {
    return (<Card>
      <CardHeader>
        <CardTitle>Food Trucks</CardTitle>
        <CardDescription>
          Manage your food trucks and their details. ({total} total)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Cuisine</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Quality Score</TableHead>
              <TableHead>Last Scraped</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {trucks.map((truck) => (<FoodTruckTableRow key={truck.id} truck={truck}/>))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>);
}
export default async function FoodTruckManagementPage() {
    const { trucks, total } = await FoodTruckService.getAllTrucks(100, 0); // Fetch first 100 trucks
    return (<div className="flex flex-col gap-4">
      <PageHeader />
      <FoodTrucksTable trucks={trucks} total={total}/>
    </div>);
}
