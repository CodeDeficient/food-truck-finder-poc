
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; 
import { Truck } from 'lucide-react';

interface TotalFoodTrucksCardProps {
  readonly totalFoodTrucks: number;
  readonly pendingVerifications: number;
}

/**
 * Renders a card displaying the total number of food trucks and pending verifications.
 * @example
 * TotalFoodTrucksCard({ totalFoodTrucks: 24, pendingVerifications: 3 })
 * // returns a React component with the total food trucks as 24 and 3 pending verification.
 * @param {Readonly<TotalFoodTrucksCardProps>} {totalFoodTrucks, pendingVerifications} - Props containing the number of total food trucks and pending verifications.
 * @returns {JSX.Element} A JSX element representing the TotalFoodTrucksCard component.
 * @description
 *   - Utilizes React functional component syntax.
 *   - Uses Tailwind CSS for styling.
 *   - Card displays current numbers of food trucks and verifications dynamically.
 */
export function TotalFoodTrucksCard({
  totalFoodTrucks,
  pendingVerifications,
}: Readonly<TotalFoodTrucksCardProps>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Food Trucks</CardTitle>
        <Truck className="size-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalFoodTrucks}</div>
        <p className="text-xs text-muted-foreground">{pendingVerifications} pending verification</p>
      </CardContent>
    </Card>
  );
}
